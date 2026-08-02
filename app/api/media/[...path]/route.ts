import { getAdminContext } from "@/lib/auth";
import { getSupabaseAdmin, isSupabaseBackendEnabled } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PUBLIC_MEDIA_ROOTS = new Set(["site", "rentals", "references"]);

function referencesPath(value: unknown, publicPath: string): boolean {
  if (typeof value !== "string") return false;
  try {
    return decodeURIComponent(new URL(value, "https://jkp.invalid").pathname) === publicPath;
  } catch {
    return false;
  }
}

function arrayReferencesPath(value: unknown, publicPath: string): boolean {
  return Array.isArray(value) && value.some((item) => referencesPath(item, publicPath));
}

async function isPublishedMedia(storagePath: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const publicPath = `/api/media/${storagePath}`;
  const [{ data: content }, { data: rentals }, { data: references }] = await Promise.all([
    supabase.from("jkp_site_content").select("content").eq("key", "main").maybeSingle(),
    supabase.from("jkp_rental_properties").select("type,status,mainImage,gallery").eq("published", true).eq("hidden", false),
    supabase.from("jkp_references").select("imageUrl,gallery").eq("published", true).eq("hidden", false).eq("permission_confirmed", true),
  ]);

  const siteContent = content?.content && typeof content.content === "object"
    ? content.content as Record<string, unknown>
    : null;
  const hero = siteContent?.hero && typeof siteContent.hero === "object"
    ? siteContent.hero as Record<string, unknown>
    : null;
  if (referencesPath(hero?.imageUrl, publicPath)) return true;

  if ((rentals || []).some((rental) =>
    (rental.type === "holiday" || rental.status === "available") &&
    (referencesPath(rental.mainImage, publicPath) || arrayReferencesPath(rental.gallery, publicPath)),
  )) return true;

  return (references || []).some((reference) =>
    referencesPath(reference.imageUrl, publicPath) || arrayReferencesPath(reference.gallery, publicPath),
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const safeSegments = (segments || []).filter(
    (segment) => segment && segment !== "." && segment !== ".." && !segment.includes("\\"),
  );

  if (
    !safeSegments.length ||
    safeSegments.length !== segments.length ||
    !PUBLIC_MEDIA_ROOTS.has(safeSegments[0]) ||
    !safeSegments.at(-1)?.toLowerCase().endsWith(".webp")
  ) {
    return new Response("Not found", { status: 404 });
  }

  if (!isSupabaseBackendEnabled()) {
    return new Response("Media unavailable", { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return new Response("Media unavailable", { status: 503 });

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "jkp-media";
  const storagePath = safeSegments.join("/");
  const published = await isPublishedMedia(storagePath);
  if (!published && !(await getAdminContext())) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "private, no-store" } });
  }
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);

  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(await data.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type": data.type || "image/webp",
      "Cache-Control": published
        ? "public, max-age=31536000, immutable"
        : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
