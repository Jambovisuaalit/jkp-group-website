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

  return (
    <>
      <AdminDashboard enabled={enabled} />
      <a
        href="/admin/forgot-password"
        style={{
          position: "fixed",
          right: 18,
          bottom: 16,
          zIndex: 90,
          padding: "9px 12px",
          border: "1px solid rgba(23,61,53,.22)",
          background: "rgba(255,255,255,.94)",
          color: "#173d35",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 10px 28px rgba(26,35,32,.10)",
        }}
      >
        Unohtuiko salasana?
      </a>
    </>
  );
}
