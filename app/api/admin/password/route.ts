import { NextResponse } from "next/server";
import { changeAdminPassword } from "@/lib/auth";

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    currentPassword?: string;
    newPassword?: string;
  };

  const currentPassword = body.currentPassword || "";
  const newPassword = body.newPassword || "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { message: "Anna nykyinen ja uusi salasana." },
      { status: 400 },
    );
  }

  const result = await changeAdminPassword(currentPassword, newPassword);
  return NextResponse.json(
    { message: result.message },
    { status: result.ok ? 200 : 400 },
  );
}
