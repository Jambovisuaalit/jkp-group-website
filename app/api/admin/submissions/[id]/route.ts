import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { normalizeSubmission } from "@/lib/admin-records";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SubmissionStatus } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };
const allowed: SubmissionStatus[] = ["new", "contacted", "processed", "archived", "spam"];

export async function PUT(request: Request, context: RouteContext) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ message: "Supabasea ei ole konfiguroitu." }, { status: 503 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { status?: SubmissionStatus };
  if (!body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ message: "Virheellinen käsittelytila." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("jkp_form_submissions")
    .update({ status: body.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: "Viestin tilan päivitys epäonnistui." }, { status: 500 });
  }

  return NextResponse.json({ item: normalizeSubmission(data) });
}
