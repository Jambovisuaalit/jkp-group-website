import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getSessionToken, passwordMatches } from "@/lib/auth";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ message: "Hallinnan salasanaa ei ole konfiguroitu." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  if (!passwordMatches(body.password || "")) return NextResponse.json({ message: "Väärä salasana." }, { status: 401 });
  const token = getSessionToken();
  if (!token) return NextResponse.json({ message: "Istuntoa ei voitu muodostaa." }, { status: 503 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
