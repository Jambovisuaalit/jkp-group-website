import type { Metadata } from "next";
import { AdminEditor } from "@/components/AdminEditor";

export const metadata: Metadata = {
  title: "Sisällönhallinta",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const supabaseEnabled = process.env.DATA_BACKEND?.toLowerCase() === "supabase";

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-heading">
          <span>JKP / CONTENT</span>
          <h1>Sivuston tekstien hallinta</h1>
          <p>
            {supabaseEnabled
              ? "Muokkaa vain vahvistettuja tietoja. Tallennus julkaisee muutokset välittömästi."
              : "Hallintanäkymä on teknisesti valmiina, mutta tallennus aktivoituu vasta, kun JKP:n Supabase-ympäristö on kytketty."}
          </p>
        </div>
        {supabaseEnabled ? (
          <AdminEditor />
        ) : (
          <section className="admin-card" aria-labelledby="admin-static-title">
            <p className="eyebrow">Static-tila</p>
            <h2 id="admin-static-title">Sisältöä ylläpidetään toistaiseksi GitHubissa.</h2>
            <p>
              Supabase-valmius, migraatio ja hallintakomponentit säilyvät projektissa. Julkiseen käyttöön hallinta avataan vasta palvelinympäristön ja käyttöoikeuksien testauksen jälkeen.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
