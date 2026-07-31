import { NextResponse } from "next/server";
import type { SiteContent } from "@/content/defaults";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteContent, isContentStorageConfigured, saveSiteContent } from "@/lib/content";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  return NextResponse.json(await getSiteContent());
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  if (!isContentStorageConfigured()) return NextResponse.json({ message: "Sisältötietokantaa ei ole konfiguroitu." }, { status: 503 });
  try {
    const content = (await request.json()) as SiteContent;
    if (!content?.hero?.title || !content?.company?.email || !Array.isArray(content.services)) return NextResponse.json({ message: "Sisältö ei ole kelvollinen." }, { status: 400 });
    await saveSiteContent(content);
    return NextResponse.json({ message: "Tallennettu." });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Tallennus epäonnistui." }, { status: 500 });
  }
}
