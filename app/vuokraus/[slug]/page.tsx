import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteContent } from "@/lib/content";
import { getRentalBySlug } from "@/lib/rentals";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const typeLabels = {
  holiday: "Loma-asunto tai kiinteistö",
  commercial: "Liike- tai toimitila",
  residential: "Vuokra-asunto",
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getRentalBySlug(slug);

  if (!property) return { title: "Kohdetta ei löytynyt" };

  return {
    title: property.title,
    description: property.summary || property.description,
    alternates: { canonical: `/vuokraus/${property.slug}` },
    openGraph: property.mainImage ? { images: [property.mainImage] } : undefined,
  };
}

export default async function RentalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [content, property] = await Promise.all([getSiteContent(), getRentalBySlug(slug)]);
  if (!property) notFound();

  const contactTarget = property.type === "commercial" ? "/vuokraus#toimitilakysely" : "/vuokraus#vuokrahakemus";
  const gallery = [property.mainImage, ...property.gallery].filter(Boolean);

  return (
    <>
      <Header email={content.company.email} />
      <main>
        <section className="subhero rental-hero">
          <div className="shell subhero-grid">
            <div>
              <p className="eyebrow">{typeLabels[property.type]}</p>
              <h1>{property.title}</h1>
              <p>{property.summary || property.description}</p>
              <div className="hero-actions">
                <Link className="button" href={contactTarget}>Kysy kohteesta</Link>
                <Link className="button" href="/vuokraus">Takaisin kohteisiin</Link>
              </div>
            </div>
            <div className="hero-visual" style={property.mainImage ? { backgroundImage: `linear-gradient(rgba(9, 28, 23, 0.18), rgba(9, 28, 23, 0.68)), url("${property.mainImage}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>
              <div><span>{property.city || "JKP / SPACE"}</span><strong>{property.price || "Kysy lisätiedot"}</strong></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell about-grid">
            <div className="about-copy">
              <p className="eyebrow">Kohteen tiedot</p>
              <h2>{property.address || property.title}</h2>
              <p>{property.description || property.summary}</p>
              <div className="proof-row">
                {property.area ? <div><strong>{property.area}</strong><span>Pinta-ala</span></div> : null}
                {property.rooms ? <div><strong>{property.rooms}</strong><span>Tilat</span></div> : null}
                {property.price ? <div><strong>{property.price}</strong><span>Hinta</span></div> : null}
              </div>
            </div>
            <div className="about-panel">
              <span>{property.status === "available" ? "Vapaa" : "Kohde"}</span>
              <strong>{property.contactName}</strong>
              <p>{property.highlights.join(" · ") || "Lisätiedot saat suoraan JKP Groupilta."}</p>
            </div>
          </div>
        </section>

        {property.details.length > 0 ? (
          <section className="section services-preview">
            <div className="shell section-heading"><div><p className="eyebrow">Varustelu ja lisätiedot</p><h2>Kohteen keskeiset ominaisuudet.</h2></div></div>
            <div className="shell service-grid">
              {property.details.map((detail, index) => <article className="service-card" key={`${detail}-${index}`}><span>0{index + 1}</span><h3>{detail}</h3></article>)}
            </div>
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section className="section">
            <div className="shell section-heading"><div><p className="eyebrow">Kuvat</p><h2>Tutustu kohteeseen.</h2></div></div>
            <div className="shell property-grid">
              {gallery.map((url, index) => (
                <div className="property-card" key={`${url}-${index}`}>
                  <div className="property-media" style={{ minHeight: 320, backgroundImage: `url("${url}")` }} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="contact-section">
          <div className="shell contact-grid">
            <div><p className="eyebrow">Seuraava vaihe</p><h2>Kysy kohteesta suoraan.</h2><p>Siirry oikeaan lomakkeeseen. Arkaluonteisia henkilötietoja ei kerätä julkisella verkkolomakkeella.</p></div>
            <div><Link className="button" href={contactTarget}>Avaa yhteydenottolomake</Link></div>
          </div>
        </section>
      </main>
      <Footer content={content} />
    </>
  );
}
