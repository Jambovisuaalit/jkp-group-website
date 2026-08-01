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
    phone: "+358 50 068 9855",
    area: "Jyväskylä ja Keski-Suomi",
  },
  hero: {
    eyebrow: "Talotekniikka, kiinteistöt ja vuokraus vuodesta 1993",
    title: "Hankkeet hallintaan. Tilat tehokkaaseen käyttöön.",
    lead:
      "JKP Group Oy on jyväskyläläinen, omistajavetoinen asiantuntija- ja kiinteistöyhtiö. Talotekninen rakennuttaminen, valvonta ja LVI-suunnittelu yhdistyvät käytännönläheiseen kiinteistö- ja vuokrausosaamiseen.",
    imageUrl: "",
  },
  about: {
    title: "Pitkäjänteistä talotekniikan ja kiinteistöjen osaamista vuodesta 1993.",
    body:
      "JKP Group Oy:n toimintamalli on suora ja vastuullinen. Toimitusjohtaja Jari Koskela toimii asiakkaan yhteyshenkilönä ja vie kokonaisuuksia eteenpäin ilman tarpeettomia välikäsiä. Vuoden 2024 taloustiedot osoittavat vahvaa vakavaraisuutta ja kannattavuutta: omavaraisuusaste oli 84,2 % ja liikevoittoprosentti 40,2 %.",
  },
  businessAreas: [
    {
      slug: "talotekniikka",
      title: "Talotekniikan rakennuttaminen ja valvonta",
      summary:
        "Rakennuttaminen, työmaavalvonta, LVI-suunnittelu ja kustannusten hallinta yhdeltä kokeneelta vastuuhenkilöltä.",
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
      "Ota suoraan yhteyttä Jari Koskelaan. Lähetä lyhyt kuvaus tilanteesta, niin saat vastauksen ilman monimutkaista myyntiprosessia.",
  },
};
