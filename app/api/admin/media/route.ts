import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 6_000_000;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
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

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json({ message: "Sallittuja tiedostomuotoja ovat JPEG, PNG ja WebP." }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Kuvan enimmäiskoko on 6 Mt." }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "jkp-media";
    const path = `website/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { data, error } = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

    if (error) {
      console.error("JKP media upload failed", error.message);
      return NextResponse.json({ message: "Kuvan tallennus epäonnistui." }, { status: 502 });
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ path: data.path, url: publicUrl.publicUrl });
  } catch {
    return NextResponse.json({ message: "Kuvan käsittely epäonnistui." }, { status: 400 });
  }
}
