import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { normalizeSubmission } from "@/lib/admin-records";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ message: "Supabasea ei ole konfiguroitu." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("jkp_form_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ message: "Lomakeviestien lataus epäonnistui." }, { status: 500 });
  }

  return NextResponse.json({ items: (data || []).map((row) => normalizeSubmission(row)) });
}
