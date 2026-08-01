import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import {
  normalizeRental,
  publicationColumns,
  slugify,
  stringArray,
} from "@/lib/admin-records";
import type { AdminRental, PublicationState } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Partial<AdminRental>;
  const title = body.title?.trim() || "";
  const slug = slugify(body.slug?.trim() || title);
  if (!id || !title || !slug) {
    return NextResponse.json({ message: "Kohteen nimi on pakollinen." }, { status: 400 });
  }

  const state: PublicationState =
    body.publicationState === "published" || body.publicationState === "hidden"
      ? body.publicationState
      : "draft";

  const payload = {
    slug,
    title,
    type:
      body.type === "commercial" || body.type === "residential"
        ? body.type
        : "holiday",
    status:
      body.availability === "available" || body.availability === "occupied"
        ? body.availability
        : "always_active",
    city: body.city?.trim() || "",
    address: body.address?.trim() || "",
    summary: body.summary?.trim() || "",
    description: body.description?.trim() || "",
    price: body.price?.trim() || "",
    area: body.area?.trim() || "",
    rooms: body.rooms?.trim() || "",
    mainImage: body.mainImage?.trim() || "",
    gallery: stringArray(body.gallery),
    details: stringArray(body.details),
    highlights: stringArray(body.highlights),
    contactName: body.contactName?.trim() || "JKP Group Oy",
    sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 100,
    ...publicationColumns(state),
  };

  const { data, error } = await admin.client
    .from("jkp_rental_properties")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json(
      { message: duplicate ? "Samalla verkko-osoitteella on jo kohde." : "Kohteen tallennus epäonnistui." },
      { status: duplicate ? 409 : 500 },
    );
  }

  revalidatePath("/vuokraus");
  revalidatePath(`/vuokraus/${slug}`);
  return NextResponse.json({ item: normalizeRental(data) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  }

  const { id } = await context.params;
  const { data: existing } = await admin.client
    .from("jkp_rental_properties")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.client.from("jkp_rental_properties").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ message: "Kohteen poistaminen epäonnistui." }, { status: 500 });
  }

  revalidatePath("/vuokraus");
  if (existing?.slug) revalidatePath(`/vuokraus/${existing.slug}`);
  return NextResponse.json({ ok: true });
}
