import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://tpjkryxepyfbrldabacp.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Rzp4OcoggkrfTRzzvuT5QA_tnnymuhI";

let adminClient: SupabaseClient | null | undefined;

export function getSupabasePublicConfig() {
  // JKP admin authentication must never inherit a generic Supabase Marketplace
  // integration from another Vercel project. The public URL and publishable key
  // are safe to ship and bind Auth explicitly to JKP's production project.
  const url = process.env.JKP_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_JKP_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

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
  return Boolean(getSupabasePublicConfig());
}

export function isSupabaseBackendEnabled(): boolean {
  const mode = process.env.DATA_BACKEND?.trim().toLowerCase();
  if (mode === "static") return false;
  return isSupabaseConfigured();
}
