import { NextResponse } from "next/server";
import {
  completeAdminPasswordRecovery,
  requestAdminPasswordReset,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() || "";

  if (!email) {
    return NextResponse.json({ message: "Anna sähköpostiosoite." }, { status: 400 });
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const requestOrigin = new URL(request.url).origin;
  const redirectTo = `${configuredSiteUrl || requestOrigin}/admin/reset-password`;
  const result = await requestAdminPasswordReset(email, redirectTo);

  return NextResponse.json(
    { message: result.message },
    { status: result.ok ? 200 : 503 },
  );
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    accessToken?: string;
    refreshToken?: string;
    newPassword?: string;
  };

  const accessToken = body.accessToken || "";
  const refreshToken = body.refreshToken || "";
  const newPassword = body.newPassword || "";

  if (!accessToken || !refreshToken || !newPassword) {
    return NextResponse.json(
      { message: "Palautuslinkin tiedot tai uusi salasana puuttuvat." },
      { status: 400 },
    );
  }

  const result = await completeAdminPasswordRecovery(
    accessToken,
    refreshToken,
    newPassword,
  );

  return NextResponse.json(
    { message: result.message },
    { status: result.ok ? 200 : 400 },
  );
}
