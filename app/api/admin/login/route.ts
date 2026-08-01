import { NextResponse } from "next/server";
import { signInAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim().toLowerCase() || "";
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Anna sähköposti ja salasana." },
      { status: 400 },
    );
  }

  const result = await signInAdmin(email, password);
  if (!result.user) {
    return NextResponse.json({ message: result.message }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: result.user.id,
      email: result.user.email,
    },
  });
}
