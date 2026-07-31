import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Talotekninen rakennuttaminen ja valvonta Jyväskylä",
  description: "Talotekninen rakennuttaminen, työmaavalvonta, LVI-suunnittelu ja kustannushallinta Keski-Suomessa.",
  alternates: { canonical: "/talotekniikka" },
};
export const dynamic = "force-dynamic";

export default async function TalotekniikkaPage() {
  const content = await getSiteContent();
  return (
    <>
      <Header email={content.company.email} />
      <main>
        <section className="subhero"><div className="shell subhero-grid"><div><p className="eyebrow">Talotekniikka</p><h1>Rakennuttaminen ja valvonta, jossa vastuu ei hajaannu.</h1><p>JKP Group tukee rakennushanketta tavoitteiden määrittelystä toteutuksen valvontaan. Saat yhden kokeneen yhteyshenkilön, joka ymmärtää sekä tekniset että taloudelliset vaikutukset.</p><a className="button" href="#tarjouspyynto">Keskustele hankkeesta</a></div><div className="subhero-code"><span>JKP / TECHNICAL</span><strong>01—04</strong><p>Rakennuttaminen<br/>Valvonta<br/>LVI-suunnittelu<br/>Kustannushallinta</p></div></div></section>
        <section className="section"><div className="shell section-heading"><div><p className="eyebrow">Palvelut</p><h2>Kokonaisuus rakennetaan hankkeen tarpeen mukaan.</h2></div><p>Palvelu voidaan rajata yhteen tehtävään tai yhdistää hankkeen läpi jatkuvaksi asiantuntijavastuuksi.</p></div><div className="shell service-grid">{content.services.map((service, index) => <article className="service-card" key={service.title}><span>0{index + 1}</span><h3>{service.title}</h3><p>{service.description}</p><b>Sovitaan hankekohtaisesti</b></article>)}</div></section>
        <section className="process-section"><div className="shell"><p className="eyebrow">Toimintamalli</p><h2>Neljä vaihetta selkeään etenemiseen.</h2><ol className="process-grid"><li><span>01</span><h3>Lähtötilanne</h3><p>Tavoitteet, rajaukset, vastuut ja päätöksenteko selväksi.</p></li><li><span>02</span><h3>Suunnitelma</h3><p>Tekninen ja taloudellinen toteutusmalli ennen sitovia ratkaisuja.</p></li><li><span>03</span><h3>Ohjaus</h3><p>Työn, laadun, aikataulun ja muutosten aktiivinen seuranta.</p></li><li><span>04</span><h3>Luovutus</h3><p>Puutteet, dokumentit ja vastuut hallitusti maaliin.</p></li></ol></div></section>
        <section className="contact-section" id="tarjouspyynto"><div className="shell contact-grid"><div><p className="eyebrow">Hankekeskustelu</p><h2>Kerro, missä vaiheessa hanke on nyt.</h2><p>Lyhyt kuvaus kohteesta, aikataulusta ja tarvitusta vastuusta riittää ensimmäiseen arvioon.</p></div><ContactForm subject="Talotekniikan tarjouspyyntö" /></div></section>
      </main>
      <Footer content={content} />
    </>
  );
}
