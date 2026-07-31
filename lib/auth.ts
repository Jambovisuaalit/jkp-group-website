import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "jkp_admin_session";

function secret(): string | null {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sessionToken(): string | null {
  const value = secret();
  if (!value) return null;
  return createHmac("sha256", value).update("jkp-admin-session-v1").digest("hex");
}

export function passwordMatches(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = sessionToken();
  if (!expected) return false;
  const cookieStore = await cookies();
  const actual = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!actual) return false;
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getSessionToken(): string | null {
  return sessionToken();
}
