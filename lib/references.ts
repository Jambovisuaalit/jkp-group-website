import "server-only";

import { getSupabaseAdmin, isSupabaseBackendEnabled } from "@/lib/supabase/admin";

export type ProjectReference = {
  id: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
};

const staticReferences: ProjectReference[] = [];

export async function getPublishedReferences(): Promise<ProjectReference[]> {
  if (!isSupabaseBackendEnabled()) {
    return [...staticReferences].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("jkp_references")
    .select("id,title,category,location,summary,description,imageUrl,sortOrder")
    .eq("published", true)
    .eq("hidden", false)
    .eq("permission_confirmed", true)
    .order("sortOrder", { ascending: true });

  if (error) {
    console.error("JKP references query failed", error.message);
    return [];
  }

  return ((data || []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id || ""),
    title: String(row.title || ""),
    category: String(row.category || ""),
    location: String(row.location || ""),
    summary: String(row.summary || ""),
    description: String(row.description || ""),
    imageUrl: String(row.imageUrl || ""),
    sortOrder: Number(row.sortOrder || 100),
  }));
}
