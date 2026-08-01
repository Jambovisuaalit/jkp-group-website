import { NextResponse } from "next/server";
import { signOutAdmin } from "@/lib/auth";

export async function POST() {
  await signOutAdmin();
  return NextResponse.json({ ok: true });
}
