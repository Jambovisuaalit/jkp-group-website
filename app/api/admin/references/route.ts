import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import {
  normalizeReference,
  publicationColumns,
  stringArray,
} from "@/lib/admin-records";
import type { AdminReference, PublicationState } from "@/types/admin";

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });

  const { data, error } = await admin.client
    .from("jkp_references")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ message: "Referenssien lataus epäonnistui." }, { status: 500 });
  return NextResponse.json({ items: (data || []).map((row) => normalizeReference(row)) });
}

export async function POST(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Partial<AdminReference>;
  const title = body.title?.trim() || "";
  if (!title) return NextResponse.json({ message: "Referenssin nimi on pakollinen." }, { status: 400 });

  const state: PublicationState = body.publicationState === "published" || body.publicationState === "hidden"
    ? body.publicationState
    : "draft";

  if (state === "published" && !body.permissionConfirmed) {
    return NextResponse.json({ message: "Julkaisulupa on vahvistettava ennen julkaisua." }, { status: 400 });
  }

  const payload = {
    title,
    category: body.category?.trim() || "",
    location: body.location?.trim() || "",
    year: body.year?.trim() || "",
    role: body.role?.trim() || "",
    summary: body.summary?.trim() || "",
    description: body.description?.trim() || "",
    imageUrl: body.imageUrl?.trim() || "",
    gallery: stringArray(body.gallery),
    permission_confirmed: Boolean(body.permissionConfirmed),
    sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 100,
    ...publicationColumns(state),
  };

  const { data, error } = await admin.client.from("jkp_references").insert(payload).select("*").single();
  if (error) return NextResponse.json({ message: "Referenssin tallennus epäonnistui." }, { status: 500 });

  revalidatePath("/referenssit");
  return NextResponse.json({ item: normalizeReference(data) }, { status: 201 });
}
