import type { Metadata } from "next";
import { AdminEditor } from "@/components/AdminEditor";

export const metadata: Metadata = { title: "Sisällönhallinta", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-heading"><span>JKP / CONTENT</span><h1>Sivuston tekstien hallinta</h1><p>Muokkaa vain vahvistettuja tietoja. Tallennus julkaisee muutokset välittömästi.</p></div>
        <AdminEditor />
      </div>
    </main>
  );
}
