import "server-only";

import { cookies } from "next/headers";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { getSupabasePublicConfig, isSupabaseBackendEnabled } from "@/lib/supabase/admin";

const ACCESS_COOKIE = "jkp_admin_access";
const REFRESH_COOKIE = "jkp_admin_refresh";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

function createAuthClient(): SupabaseClient | null {
  if (!isSupabaseBackendEnabled()) return null;
  const config = getSupabasePublicConfig();
  if (!config) return null;

  return createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "X-Client-Info": "jkp-group-admin/server-auth" },
    },
  });
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

async function saveSession(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE));
  cookieStore.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE));
}

async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, "", cookieOptions(0));
  cookieStore.set(REFRESH_COOKIE, "", cookieOptions(0));
}

async function isAllowedAdmin(user: User, client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client
    .from("jkp_admin_users")
    .select("active")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("JKP admin authorization failed", error.message);
    return false;
  }

  return Boolean(data?.active);
}

export async function signInAdmin(email: string, password: string) {
  const client = createAuthClient();
  if (!client) return { user: null, message: "Supabase Authia ei ole konfiguroitu." };

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return { user: null, message: "Sähköposti tai salasana on virheellinen." };
  }

  if (!(await isAllowedAdmin(data.user, client))) {
    await client.auth.signOut();
    return { user: null, message: "Käyttäjällä ei ole JKP Hallinnan käyttöoikeutta." };
  }

  await saveSession(data.session.access_token, data.session.refresh_token);
  return { user: data.user, message: "" };
}

export async function getAdminContext(): Promise<{ user: User; client: SupabaseClient } | null> {
  const client = createAuthClient();
  if (!client) return null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!accessToken || !refreshToken) return null;

  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    await clearSession();
    return null;
  }

  if (!(await isAllowedAdmin(data.user, client))) {
    await clearSession();
    return null;
  }

  if (
    data.session.access_token !== accessToken ||
    data.session.refresh_token !== refreshToken
  ) {
    await saveSession(data.session.access_token, data.session.refresh_token);
  }

  return { user: data.user, client };
}

export async function getAdminUser(): Promise<User | null> {
  return (await getAdminContext())?.user || null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return Boolean(await getAdminContext());
}

export async function signOutAdmin(): Promise<void> {
  const client = createAuthClient();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (client && accessToken && refreshToken) {
    await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    await client.auth.signOut();
  }

  await clearSession();
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const context = await getAdminContext();
  const user = context?.user;
  if (!user?.email) return { ok: false, message: "Istunto on vanhentunut." };
  if (newPassword.length < 12) {
    return { ok: false, message: "Uuden salasanan on oltava vähintään 12 merkkiä." };
  }

  const client = createAuthClient();
  if (!client) return { ok: false, message: "Supabase Authia ei ole konfiguroitu." };

  const { data: loginData, error: loginError } = await client.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (loginError || !loginData.session) {
    return { ok: false, message: "Nykyinen salasana on virheellinen." };
  }

  const { data, error } = await client.auth.updateUser({ password: newPassword });
  if (error || !data.user) {
    return { ok: false, message: "Salasanan vaihtaminen epäonnistui." };
  }

  const { data: refreshed } = await client.auth.getSession();
  if (refreshed.session) {
    await saveSession(refreshed.session.access_token, refreshed.session.refresh_token);
  }

  return { ok: true, message: "Salasana vaihdettiin." };
}

export async function requestAdminPasswordReset(email: string, redirectTo: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: true, message: "Jos käyttäjätili löytyy, palautuslinkki lähetetään sähköpostiin." };
  }

  const client = createAuthClient();
  if (!client) {
    return { ok: false, message: "Supabase Authia ei ole konfiguroitu." };
  }

  const { error } = await client.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
  if (error) {
    console.error("JKP password reset request failed", error.message);
  }

  return { ok: true, message: "Jos käyttäjätili löytyy, palautuslinkki lähetetään sähköpostiin." };
}

export async function completeAdminPasswordRecovery(
  accessToken: string,
  refreshToken: string,
  newPassword: string,
) {
  if (newPassword.length < 12) {
    return { ok: false, message: "Uuden salasanan on oltava vähintään 12 merkkiä." };
  }

  const client = createAuthClient();
  if (!client) return { ok: false, message: "Supabase Authia ei ole konfiguroitu." };

  const { data: sessionData, error: sessionError } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError || !sessionData.session || !sessionData.user) {
    return { ok: false, message: "Palautuslinkki on virheellinen tai vanhentunut." };
  }

  if (!(await isAllowedAdmin(sessionData.user, client))) {
    await client.auth.signOut();
    return { ok: false, message: "Käyttäjällä ei ole JKP Hallinnan käyttöoikeutta." };
  }

  const { data, error } = await client.auth.updateUser({ password: newPassword });
  if (error || !data.user) {
    return { ok: false, message: "Salasanan palauttaminen epäonnistui." };
  }

  const { data: refreshed } = await client.auth.getSession();
  if (refreshed.session) {
    await saveSession(refreshed.session.access_token, refreshed.session.refresh_token);
  }

  return { ok: true, message: "Salasana vaihdettiin. Hallinta on nyt käytettävissä." };
}
