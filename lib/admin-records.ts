import type {
  AdminReference,
  AdminRental,
  AdminSubmission,
  PublicationState,
  RentalAvailability,
  RentalType,
  SubmissionKind,
  SubmissionStatus,
} from "@/types/admin";

export function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function publicationState(row: Record<string, unknown>): PublicationState {
  if (row.hidden === true) return "hidden";
  return row.published === true ? "published" : "draft";
}

export function publicationColumns(state: PublicationState) {
  return {
    published: state === "published",
    hidden: state === "hidden",
  };
}

export function normalizeRental(row: Record<string, unknown>): AdminRental {
  const type: RentalType =
    row.type === "commercial" || row.type === "residential" ? row.type : "holiday";
  const availability: RentalAvailability =
    row.status === "available" || row.status === "occupied" ? row.status : "always_active";

  return {
    id: String(row.id || ""),
    slug: String(row.slug || ""),
    title: String(row.title || ""),
    type,
    availability,
    city: String(row.city || ""),
    address: String(row.address || ""),
    summary: String(row.summary || ""),
    description: String(row.description || ""),
    price: String(row.price || ""),
    area: String(row.area || ""),
    rooms: String(row.rooms || ""),
    mainImage: String(row.mainImage || ""),
    gallery: stringArray(row.gallery),
    details: stringArray(row.details),
    highlights: stringArray(row.highlights),
    contactName: String(row.contactName || "JKP Group Oy"),
    publicationState: publicationState(row),
    sortOrder: Number(row.sortOrder || 100),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

export function normalizeReference(row: Record<string, unknown>): AdminReference {
  return {
    id: String(row.id || ""),
    title: String(row.title || ""),
    category: String(row.category || ""),
    location: String(row.location || ""),
    year: String(row.year || ""),
    role: String(row.role || ""),
    summary: String(row.summary || ""),
    description: String(row.description || ""),
    imageUrl: String(row.imageUrl || ""),
    gallery: stringArray(row.gallery),
    permissionConfirmed: Boolean(row.permission_confirmed),
    publicationState: publicationState(row),
    sortOrder: Number(row.sortOrder || 100),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

export function normalizeSubmission(row: Record<string, unknown>): AdminSubmission {
  const kind: SubmissionKind =
    row.kind === "commercial" || row.kind === "residential" ? row.kind : "contact";
  const allowedStatuses: SubmissionStatus[] = [
    "new",
    "contacted",
    "processed",
    "archived",
    "spam",
  ];
  const status = allowedStatuses.includes(row.status as SubmissionStatus)
    ? (row.status as SubmissionStatus)
    : "new";

  return {
    id: String(row.id || ""),
    createdAt: String(row.created_at || ""),
    kind,
    status,
    name: String(row.name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    company: String(row.company || ""),
    businessId: String(row.business_id || ""),
    property: String(row.property || ""),
    message: String(row.message || ""),
    details:
      row.details && typeof row.details === "object"
        ? (row.details as Record<string, unknown>)
        : {},
  };
}
