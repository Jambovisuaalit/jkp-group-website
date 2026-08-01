import { NextResponse } from "next/server";
import { defaultContent, type SiteContent } from "@/content/defaults";
import { getAdminContext } from "@/lib/auth";

const CONTENT_KEY = "main";

function mergeContent(base: SiteContent, incoming: Partial<SiteContent>): SiteContent {
  return {
    ...base,
    ...incoming,
    company: { ...base.company, ...incoming.company },
    hero: { ...base.hero, ...incoming.hero },
    about: { ...base.about, ...incoming.about },
    rental: { ...base.rental, ...incoming.rental },
    contact: { ...base.contact, ...incoming.contact },
    businessAreas: incoming.businessAreas?.length ? incoming.businessAreas : base.businessAreas,
    services: incoming.services?.length ? incoming.services : base.services,
  };
}

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });

  const { data, error } = await admin.client
    .from("jkp_site_content")
    .select("content")
    .eq("key", CONTENT_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: "Sisällön lataus epäonnistui." }, { status: 500 });
  }

  const incoming = data?.content && typeof data.content === "object"
    ? (data.content as Partial<SiteContent>)
    : {};

  return NextResponse.json(mergeContent(defaultContent, incoming));
}

export async function PUT(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });

  try {
    const content = (await request.json()) as SiteContent;
    if (!content?.hero?.title || !content?.company?.email || !Array.isArray(content.services)) {
      return NextResponse.json({ message: "Sisältö ei ole kelvollinen." }, { status: 400 });
    }

    const { error } = await admin.client
      .from("jkp_site_content")
      .upsert({ key: CONTENT_KEY, content }, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ message: "Sisällön tallennus Supabaseen epäonnistui." }, { status: 500 });
    }

    return NextResponse.json({ message: "Tallennettu." });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Tallennus epäonnistui." }, { status: 500 });
  }
}
