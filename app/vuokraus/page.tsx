import type { Metadata } from "next";
import Link from "next/link";
import { BusinessPremisesForm, ApartmentApplicationForm } from "@/components/RentalForms";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteContent } from "@/lib/content";
import { getPublishedRentals } from "@/lib/rentals";

export const metadata: Metadata = {
  title: "Liike-, toimitila- ja asuntovuokraus Jyväskylä",
  description: "JKP Groupin vuokrattavat liike- ja toimitilat sekä asuntovuokrauksen hakemus Jyväskylän alueella.",
  alternates: { canonical: "/vuokraus" },
};
export const dynamic = "force-dynamic";

const typeLabels = {
  holiday: "Loma-asunto tai kiinteistö",
  commercial: "Liike- tai toimitila",
  residential: "Vuokra-asunto",
} as const;

export default async function VuokrausPage() {
  const [content, properties] = await Promise.all([getSiteContent(), getPublishedRentals()]);

  return (
    <>
      <Header email={content.company.email} />
      <main>
        <section className="subhero rental-hero">
          <div className="shell subhero-grid">
            <div>
              <p className="eyebrow">Vuokraus</p>
              <h1>{content.rental.title}</h1>
              <p>{content.rental.lead}</p>
              <div className="hero-actions">
                <a className="button" href="#toimitilakysely">Kysy toimitilaa</a>
                <a className="button" href="#vuokrahakemus">Täytä vuokrahakemus</a>
              </div>
            </div>
            <div className="hero-visual"><div><span>JKP / SPACE</span><strong>Tilaa toimia.</strong></div></div>
          </div>
        </section>

        <section className="section">
          <div className="shell section-heading">
            <div><p className="eyebrow">Vuokrattavat kohteet</p><h2>Ajantasaiset kohteet yhdestä näkymästä.</h2></div>
            <p>Loma-asunnot ja kiinteistöt pysyvät näkyvissä jatkuvasti. Liike-, toimitila- ja asuntokohteet näkyvät vain vapaina.</p>
          </div>

          {properties.length > 0 ? (
            <div className="shell property-grid">
              {properties.map((property) => (
                <Link className="property-card" href={`/vuokraus/${property.slug}`} key={property.id}>
                  <div className="property-media" style={property.mainImage ? { backgroundImage: `url("${property.mainImage}")` } : undefined} />
                  <div className="property-content">
                    <small>{property.city || typeLabels[property.type]}</small>
                    <h3>{property.title}</h3>
                    <p>{property.summary || property.description}</p>
                    <div className="hero-actions">
                      {property.price ? <strong>{property.price}</strong> : null}
                      <span>Tutustu kohteeseen →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="shell">
              <article className="property-card">
                <div className="property-media" />
                <div className="property-content"><small>Kohdetiedot päivittyvät</small><h3>Kysy tämänhetkisestä tarjonnasta</h3><p>Vahvistettuja vapaita kohteita ei ole juuri nyt julkaistu. Lähetä tilakysely tai ota suoraan yhteyttä.</p></div>
              </article>
            </div>
          )}
        </section>

        <section className="contact-section" id="toimitilakysely">
          <div className="shell contact-grid">
            <div><p className="eyebrow">Yrityksille</p><h2>B2B-toimitilojen tarjouspyyntö</h2><p>Kerro yrityksestä, tilatarpeesta, pinta-alasta, sijainnista ja tavoiteaikataulusta.</p></div>
            <BusinessPremisesForm />
          </div>
        </section>

        <section className="section" id="vuokrahakemus">
          <div className="shell contact-grid">
            <div><p className="eyebrow">Asuntovuokraus</p><h2>Vuokralaisen hakemuslomake</h2><p>Täytä hakemus sen jälkeen, kun olet ollut yhteydessä JKP Groupiin ilmoitetusta kohteesta.</p></div>
            <ApartmentApplicationForm />
          </div>
        </section>
      </main>
      <Footer content={content} />
    </>
  );
}
