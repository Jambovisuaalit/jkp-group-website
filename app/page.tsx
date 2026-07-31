import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();
  const heroStyle = content.hero.imageUrl
    ? {
        backgroundImage: `linear-gradient(145deg, rgba(9, 28, 23, 0.22), rgba(9, 28, 23, 0.84)), url("${content.hero.imageUrl}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }
    : undefined;

  return (
    <>
      <Header email={content.company.email} />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1>{content.hero.title}</h1>
              <p className="hero-lead">{content.hero.lead}</p>
              <div className="hero-actions">
                <a className="button" href="#yhteys">Kerro tarpeesta</a>
                <Link className="text-link" href="/talotekniikka">Tutustu palveluihin <span>→</span></Link>
              </div>
              <div className="proof-row">
                <div><strong>1993</strong><span>Perustettu</span></div>
                <div><strong>2</strong><span>Liiketoiminta-aluetta</span></div>
                <div><strong>1</strong><span>Suora vastuuhenkilö</span></div>
              </div>
            </div>
            <div className="hero-visual" aria-label="JKP Groupin palvelukokonaisuus" style={heroStyle}>
              <div className="eyebrow">JKP / PROJECT CONTROL</div>
              <div className="visual-ring"><span>Hanke</span><strong>Hallinnassa</strong></div>
            </div>
          </div>
        </section>

        <section className="section business-section">
          <div className="shell section-heading">
            <div><p className="eyebrow">Kaksi selkeää palvelupolkua</p><h2>Valitse asia, jonka haluat ratkaista.</h2></div>
            <p>Tekninen hanke ja toimitilan tarve vaativat eri lähtötiedot. Siksi ne on erotettu omiksi, nopeasti ymmärrettäviksi kokonaisuuksiksi.</p>
          </div>
          <div className="shell business-grid">
            {content.businessAreas.map((area, index) => (
              <Link className="business-card" href={`/${area.slug}`} key={area.slug}>
                <span className="eyebrow">0{index + 1}</span>
                <div><h3>{area.title}</h3><p>{area.summary}</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section about-section">
          <div className="shell about-grid">
            <div className="about-panel"><span>32+</span><strong>vuotta yritystoimintaa</strong><p>Vakiintunut toimija, selkeä vastuu ja käytännönläheinen päätöksenteko.</p></div>
            <div className="about-copy"><p className="eyebrow">JKP Group Oy</p><h2>{content.about.title}</h2><p>{content.about.body}</p><Link className="text-link" href="/referenssit">Katso referenssit →</Link></div>
          </div>
        </section>

        <section className="section services-preview">
          <div className="shell section-heading"><div><p className="eyebrow">Talotekniikka</p><h2>Tekninen laatu ilman hallinnollista sumua.</h2></div></div>
          <div className="shell service-grid">
            {content.services.map((service, index) => <article className="service-card" key={service.title}><span>0{index + 1}</span><h3>{service.title}</h3><p>{service.description}</p></article>)}
          </div>
        </section>

        <section className="contact-section" id="yhteys">
          <div className="shell contact-grid">
            <div><p className="eyebrow">Suora yhteys</p><h2>{content.contact.title}</h2><p>{content.contact.body}</p><a href={`mailto:${content.company.email}`}>{content.company.email}</a></div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer content={content} />
      <a className="mobile-contact" href="#yhteys">Ota yhteyttä <span>→</span></a>
    </>
  );
}
