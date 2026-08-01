import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "JKP Hallinta",
  description: "JKP Groupin suojattu sisällönhallintapaneeli.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const enabled = Boolean(
    process.env.DATA_BACKEND?.toLowerCase() === "supabase" &&
      (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return <AdminDashboard enabled={enabled} />;
}
