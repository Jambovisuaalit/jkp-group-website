import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseBackendEnabled } from "@/lib/supabase/admin";

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

function buildEmailLines(body: Record<string, unknown>): string[] {
  const ignoredKeys = new Set(["subject", "website", "startedAt"]);

  return Object.entries(body)
    .filter(([key]) => !ignoredKeys.has(key))
    .map(([key, value]) => {
      const cleaned = clean(value, key === "message" ? 3000 : 300);
      return `${labels[key] || key}: ${cleaned || "-"}`;
    });
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

    if (isSupabaseBackendEnabled()) {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        return NextResponse.json({ message: "Tietokantatallennusta ei ole konfiguroitu." }, { status: 503 });
      }

      const { error: databaseError } = await supabase.from("jkp_form_submissions").insert({
        kind,
        name,
        email,
        phone,
        company: company || null,
        business_id: businessId || null,
        property: property || null,
        message,
        details: buildDetails(body),
        consent: true,
        source: "website",
      });

      if (databaseError) {
        console.error("JKP form persistence failed", databaseError.message);
        return NextResponse.json({ message: "Tietojen tallennus epäonnistui. Yritä myöhemmin uudelleen." }, { status: 502 });
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    const to = (process.env.CONTACT_TO_EMAIL || "jari.koskela@jkpgroup.fi").trim();
    const emailSubject = `${subject}: ${name}`;
    const emailBody = buildEmailLines(body).join("\n");

    if (apiKey && from) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: emailSubject,
          text: emailBody,
        }),
      });

      if (emailResponse.ok) {
        return NextResponse.json({ message: "Tiedot vastaanotettu.", delivery: "resend" });
      }

      console.error("JKP Resend notification failed", await emailResponse.text());
    }

    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return NextResponse.json({
      message: "Sähköpostiohjelma avataan. Lähetä viesti sieltä loppuun.",
      delivery: "mailto",
      mailtoUrl,
    });
  } catch {
    return NextResponse.json({ message: "Virheellinen lomakepyyntö." }, { status: 400 });
  }
}
