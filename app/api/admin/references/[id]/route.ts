import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import {
  normalizeReference,
  publicationColumns,
  stringArray,
} from "@/lib/admin-records";
import type { AdminReference, PublicationState } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });

  const { id } = await context.params;
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

  const { data, error } = await admin.client.from("jkp_references").update(payload).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ message: "Referenssin tallennus epäonnistui." }, { status: 500 });

  revalidatePath("/referenssit");
  return NextResponse.json({ item: normalizeReference(data) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });

  const { id } = await context.params;
  const { error } = await admin.client.from("jkp_references").delete().eq("id", id);
  if (error) return NextResponse.json({ message: "Referenssin poistaminen epäonnistui." }, { status: 500 });

  revalidatePath("/referenssit");
  return NextResponse.json({ ok: true });
}
