import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 12_000_000;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ message: "Supabasea ei ole konfiguroitu." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Valitse kuvatiedosto." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ message: "Sallittuja tiedostomuotoja ovat JPEG, PNG ja WebP." }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Alkuperäisen kuvan enimmäiskoko on 12 Mt." }, { status: 400 });
    }

    const source = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(source)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toBuffer();

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "jkp-media";
    const folder = String(formData.get("folder") || "website").replace(/[^a-z0-9/-]/gi, "");
    const path = `${folder || "website"}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.webp`;

    const { data, error } = await supabase.storage.from(bucket).upload(path, optimized, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

    if (error) {
      console.error("JKP media upload failed", error.message);
      return NextResponse.json({ message: "Kuvan tallennus epäonnistui." }, { status: 502 });
    }

    const encodedPath = data.path.split("/").map(encodeURIComponent).join("/");
    return NextResponse.json({
      path: data.path,
      url: `/api/media/${encodedPath}`,
      bytes: optimized.byteLength,
      format: "webp",
    });
  } catch (error) {
    console.error("JKP image processing failed", error);
    return NextResponse.json({ message: "Kuvan käsittely epäonnistui." }, { status: 400 });
  }
}
