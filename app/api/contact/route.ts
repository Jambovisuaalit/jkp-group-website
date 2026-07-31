import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const labels: Record<string, string> = {
  company: "Yritys",
  businessId: "Y-tunnus",
  name: "Nimi / yhteyshenkilö",
  email: "Sähköposti",
  phone: "Puhelin",
  spaceType: "Tilatyyppi",
  areaNeed: "Tarvittava pinta-ala",
  preferredLocation: "Toivottu sijainti",
  startDate: "Aloitusajankohta",
  property: "Haettava kohde",
  occupants: "Asukkaiden määrä",
  moveInDate: "Toivottu muuttopäivä",
  rentalDuration: "Arvioitu asumisen kesto",
  pets: "Lemmikit",
  smoking: "Tupakointi",
  message: "Lisätiedot",
  privacyConsent: "Tietojen käsittely hyväksytty",
};

type SubmissionKind = "contact" | "commercial" | "residential";

function resolveKind(subject: string): SubmissionKind {
  if (subject.includes("B2B-toimitilan")) return "commercial";
  if (subject.includes("Asuntovuokrauksen")) return "residential";
  return "contact";
}

function buildDetails(body: Record<string, unknown>): Record<string, string> {
  const ignoredKeys = new Set([
    "subject", "website", "startedAt", "name", "email", "phone", "company",
    "businessId", "property", "message", "privacyConsent",
  ]);

  return Object.fromEntries(
    Object.entries(body)
      .filter(([key]) => !ignoredKeys.has(key))
      .map(([key, value]) => [key, clean(value, 300)])
      .filter(([, value]) => value.length > 0),
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = clean(body.name, 100);
    const email = clean(body.email, 180);
    const phone = clean(body.phone, 40);
    const company = clean(body.company, 160);
    const businessId = clean(body.businessId, 40);
    const property = clean(body.property, 180);
    const message = clean(body.message, 3000);
    const subject = clean(body.subject, 160) || "Yhteydenotto verkkosivulta";
    const website = clean(body.website, 100);
    const privacyConsent = clean(body.privacyConsent, 40);
    const startedAt = Number(body.startedAt || 0);
    const kind = resolveKind(subject);

    if (website) return NextResponse.json({ message: "Lomakkeen lähetys epäonnistui." }, { status: 400 });
    if (!name || !email || !message || !email.includes("@")) {
      return NextResponse.json({ message: "Täytä pakolliset yhteystiedot ja lisätiedot." }, { status: 400 });
    }
    if (kind !== "contact" && !phone) {
      return NextResponse.json({ message: "Puhelinnumero on pakollinen tässä lomakkeessa." }, { status: 400 });
    }
    if (!privacyConsent) return NextResponse.json({ message: "Hyväksy tietojen käsittely ennen lähettämistä." }, { status: 400 });
    if (!startedAt || Date.now() - startedAt < 1000) {
      return NextResponse.json({ message: "Lomake lähetettiin liian nopeasti." }, { status: 429 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ message: "Lomakepalvelua ei ole vielä konfiguroitu." }, { status: 503 });

    const details = buildDetails(body);
    const { error: databaseError } = await supabase.from("jkp_form_submissions").insert({
      kind,
      name,
      email,
      phone,
      company: company || null,
      business_id: businessId || null,
      property: property || null,
      message,
      details,
      consent: true,
      source: "website",
    });

    if (databaseError) {
      console.error("JKP form persistence failed", databaseError.message);
      return NextResponse.json({ message: "Tietojen tallennus epäonnistui. Yritä myöhemmin uudelleen." }, { status: 502 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    const to = process.env.CONTACT_TO_EMAIL || "jari.koskela@jkpgroup.fi";

    if (apiKey && from) {
      const ignoredKeys = new Set(["subject", "website", "startedAt"]);
      const lines = Object.entries(body)
        .filter(([key]) => !ignoredKeys.has(key))
        .map(([key, value]) => {
          const cleaned = clean(value, key === "message" ? 3000 : 300);
          return `${labels[key] || key}: ${cleaned || "-"}`;
        });

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `${subject}: ${name}`,
          text: lines.join("\n"),
        }),
      });

      if (!emailResponse.ok) console.error("JKP Resend notification failed", await emailResponse.text());
    }

    return NextResponse.json({ message: "Tiedot vastaanotettu." });
  } catch {
    return NextResponse.json({ message: "Virheellinen lomakepyyntö." }, { status: 400 });
  }
}
