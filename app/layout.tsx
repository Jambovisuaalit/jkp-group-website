import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jkpgroup.fi";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "JKP Group Oy | Talotekniikka, kiinteistöt ja vuokraus", template: "%s | JKP Group Oy" },
  description: "Vuodesta 1993 toiminut JKP Group Oy tarjoaa taloteknistä rakennuttamista, valvontaa, LVI-suunnittelua sekä liike- ja toimitilojen vuokrausta Jyväskylässä ja Keski-Suomessa.",
  alternates: { canonical: "/" },
  openGraph: {
    locale: "fi_FI",
    type: "website",
    siteName: "JKP Group Oy",
    title: "JKP Group Oy | Talotekniikka, kiinteistöt ja vuokraus",
    description: "Jyväskyläläinen, vuodesta 1993 toiminut talotekniikan ja kiinteistöjen asiantuntijayhtiö.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "JKP Group Oy",
    legalName: "JKP Group Oy",
    url: siteUrl,
    email: "jari.koskela@jkpgroup.fi",
    telephone: "+358500689855",
    areaServed: "Keski-Suomi",
    foundingDate: "1993-05-12",
    identifier: "0923519-9",
    employee: {
      "@type": "Person",
      name: "Jari Koskela",
      jobTitle: "Toimitusjohtaja",
    },
  };

  return (
    <html lang="fi">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </body>
    </html>
  );
}
