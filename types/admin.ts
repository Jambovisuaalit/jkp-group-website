export type PublicationState = "draft" | "published" | "hidden";
export type RentalType = "holiday" | "commercial" | "residential";
export type RentalAvailability = "available" | "occupied" | "always_active";
export type SubmissionKind = "contact" | "commercial" | "residential";
export type SubmissionStatus = "new" | "contacted" | "processed" | "archived" | "spam";

export type AdminRental = {
  id: string;
  slug: string;
  title: string;
  type: RentalType;
  availability: RentalAvailability;
  city: string;
  address: string;
  summary: string;
  description: string;
  price: string;
  area: string;
  rooms: string;
  mainImage: string;
  gallery: string[];
  details: string[];
  highlights: string[];
  contactName: string;
  publicationState: PublicationState;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminReference = {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  role: string;
  summary: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  permissionConfirmed: boolean;
  publicationState: PublicationState;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminSubmission = {
  id: string;
  createdAt: string;
  kind: SubmissionKind;
  status: SubmissionStatus;
  name: string;
  email: string;
  phone: string;
  company: string;
  businessId: string;
  property: string;
  message: string;
  details: Record<string, unknown>;
};
