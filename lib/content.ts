import "server-only";

import { defaultContent, type SiteContent } from "@/content/defaults";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const CONTENT_KEY = "main";

function mergeContent(base: SiteContent, incoming: Partial<SiteContent>): SiteContent {
  return {
    ...base,
    ...incoming,
    company: { ...base.company, ...incoming.company },
    hero: { ...base.hero, ...incoming.hero },
    about: { ...base.about, ...incoming.about },
    rental: { ...base.rental, ...incoming.rental },
    contact: { ...base.contact, ...incoming.contact },
    businessAreas: incoming.businessAreas?.length ? incoming.businessAreas : base.businessAreas,
    services: incoming.services?.length ? incoming.services : base.services,
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultContent;

  const { data, error } = await supabase
    .from("jkp_site_content")
    .select("content")
    .eq("key", CONTENT_KEY)
    .maybeSingle();

  if (error) {
    console.error("JKP content query failed", error.message);
    return defaultContent;
  }

  const incoming = data?.content && typeof data.content === "object"
    ? (data.content as Partial<SiteContent>)
    : {};

  return mergeContent(defaultContent, incoming);
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabasea ei ole konfiguroitu.");

  const { error } = await supabase
    .from("jkp_site_content")
    .upsert({ key: CONTENT_KEY, content }, { onConflict: "key" });

  if (error) throw new Error("Sisällön tallennus Supabaseen epäonnistui.");
}

export function isContentStorageConfigured(): boolean {
  return isSupabaseConfigured();
}
