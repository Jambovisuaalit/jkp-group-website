import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteContent } from "@/lib/content";
import { getPublishedReferences } from "@/lib/references";

export const metadata: Metadata = {
  title: "Referenssit",
  description: "JKP Group Oy:n talotekniset rakennuttamis-, valvonta- ja suunnittelureferenssit.",
  alternates: { canonical: "/referenssit" },
};
export const dynamic = "force-dynamic";

export default async function ReferenssitPage() {
  const [content, references] = await Promise.all([getSiteContent(), getPublishedReferences()]);

  return (
    <>
      <Header email={content.company.email} />
      <main>
        <section className="subhero">
          <div className="shell narrow">
            <p className="eyebrow">Referenssit</p>
            <h1>Työn näyttö kuuluu faktoihin, ei yleisiin väitteisiin.</h1>
            <p>Julkaisemme vain vahvistetut kohteet, joissa projektin nimi, JKP Groupin rooli, laajuus ja julkaisulupa ovat kunnossa.</p>
          </div>
        </section>

        <section className="section">
          {references.length > 0 ? (
            <div className="shell reference-grid">
              {references.map((reference, index) => (
                <article
                  className="reference-placeholder"
                  key={reference.id}
                  style={reference.imageUrl ? {
                    backgroundImage: `linear-gradient(rgba(9, 28, 23, 0.72), rgba(9, 28, 23, 0.92)), url("${reference.imageUrl}")`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    color: "white",
                  } : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{reference.category || "REFERENSSI"}</small>
                  <h2>{reference.title}</h2>
                  <p>{reference.summary || reference.description}</p>
                  {reference.location ? <strong>{reference.location}</strong> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="shell reference-grid">
              <article className="reference-placeholder">
                <span>01</span>
                <small>JULKAISULUVAT</small>
                <h2>Vahvistetut referenssit lisätään tähän.</h2>
                <p>Kohteita ei julkaista ennen asiakkaan vahvistamia tietoja, kuvia ja julkaisulupaa.</p>
              </article>
            </div>
          )}
        </section>

        <section className="contact-section">
          <div className="shell contact-grid">
            <div><p className="eyebrow">Kysy soveltuvuudesta</p><h2>Tarvitsetko kokemusta vastaavasta hankkeesta?</h2><p>Kerro hanketyyppi. JKP Group voi arvioida suoraan, vastaako osaaminen tarpeeseen.</p></div>
            <ContactForm subject="Referenssi- ja osaamiskysely" />
          </div>
        </section>
      </main>
      <Footer content={content} />
    </>
  );
}
