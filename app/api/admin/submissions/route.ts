import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { normalizeSubmission } from "@/lib/admin-records";

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ message: "Ei käyttöoikeutta." }, { status: 401 });
  }

  const { data, error } = await admin.client
    .from("jkp_form_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ message: "Lomakeviestien lataus epäonnistui." }, { status: 500 });
  }

  return NextResponse.json({ items: (data || []).map((row) => normalizeSubmission(row)) });
}
