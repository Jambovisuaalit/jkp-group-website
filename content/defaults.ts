export type ServiceItem = {
  title: string;
  description: string;
};

export type SiteContent = {
  company: {
    name: string;
    email: string;
    phone: string;
    area: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    imageUrl: string;
  };
  about: {
    title: string;
    body: string;
  };
  businessAreas: Array<{
    slug: "talotekniikka" | "vuokraus";
    title: string;
    summary: string;
  }>;
  services: ServiceItem[];
  rental: {
    title: string;
    lead: string;
  };
  contact: {
    title: string;
    body: string;
  };
};

export const defaultContent: SiteContent = {
  company: {
    name: "JKP Group Oy",
    email: "jari.koskela@jkpgroup.fi",
    phone: "",
    area: "Jyväskylä ja Keski-Suomi",
  },
  hero: {
    eyebrow: "Talotekniikan asiantuntija ja toimitilakumppani",
    title: "Hankkeet hallintaan. Tilat tehokkaaseen käyttöön.",
    lead:
      "JKP Group yhdistää kokeneen taloteknisen rakennuttamisen, valvonnan ja LVI-suunnittelun sekä joustavat liike- ja toimitilaratkaisut.",
    imageUrl: "",
  },
  about: {
    title: "Yksi kokenut vastuuhenkilö projektin alusta loppuun.",
    body:
      "JKP Group Oy on vuonna 1993 perustettu jyväskyläläinen asiantuntijayritys. Toimintamalli on suoraviivainen: asiakas tietää aina, kuka vastaa kokonaisuudesta, päätöksenteosta ja työn etenemisestä.",
  },
  businessAreas: [
    {
      slug: "talotekniikka",
      title: "Talotekniikan rakennuttaminen ja valvonta",
      summary:
        "Rakennuttaminen, työmaavalvonta, LVI-suunnittelu ja kustannusten hallinta yhdeltä kokeneelta asiantuntijalta.",
    },
    {
      slug: "vuokraus",
      title: "Liike- ja toimitilojen vuokraus",
      summary:
        "Selkeät kohdetiedot, suora yhteys omistajaan ja joustava eteneminen tilatarpeen mukaan.",
    },
  ],
  services: [
    {
      title: "Talotekninen rakennuttaminen",
      description:
        "Tavoitteiden, suunnittelun, hankintojen ja toteutuksen yhteensovitus niin, että kokonaisuus pysyy hallinnassa.",
    },
    {
      title: "Työmaavalvonta",
      description:
        "Laadun, aikataulun, sopimusten ja teknisen toteutuksen riippumaton seuranta rakennushankkeen aikana.",
    },
    {
      title: "LVI-suunnittelu",
      description:
        "Käytännölliset ja toteutuskelpoiset LVI-ratkaisut uudis- ja korjausrakentamisen tarpeisiin.",
    },
    {
      title: "Kustannushallinta",
      description:
        "Ratkaisujen ja muutosten taloudellisten vaikutusten arviointi ennen kuin kustannukset ehtivät realisoitua.",
    },
  ],
  rental: {
    title: "Tilat yrityksen todelliseen tarpeeseen.",
    lead:
      "Vuokrattavat kohteet lisätään sivustolle sitä mukaa, kun vahvistetut kohdetiedot ja kuvat ovat käytettävissä.",
  },
  contact: {
    title: "Kerro hankkeesta tai tilatarpeesta.",
    body:
      "Lähetä lyhyt kuvaus tilanteesta. Saat suoran vastauksen ilman monimutkaista myyntiprosessia.",
  },
};
