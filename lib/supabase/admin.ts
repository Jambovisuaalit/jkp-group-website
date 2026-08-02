import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null | undefined;

export function getSupabasePublicConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

function readSupabaseAdminConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) return null;
  return { url, secretKey };
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;

  const config = readSupabaseAdminConfig();
  if (!config) {
    adminClient = null;
    return adminClient;
  }

  adminClient = createClient(config.url, config.secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "jkp-group-website/server",
      },
    },
  });

  return adminClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(readSupabaseAdminConfig());
}

export function isSupabaseAuthConfigured(): boolean {
  return isSupabaseBackendEnabled() && Boolean(getSupabasePublicConfig());
}

export function isSupabaseBackendEnabled(): boolean {
  const mode = process.env.DATA_BACKEND?.trim().toLowerCase();
  return mode === "supabase" && isSupabaseConfigured();
}
