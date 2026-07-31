import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jkpgroup.fi";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "JKP Group Oy | Talotekniikka ja toimitilat", template: "%s | JKP Group Oy" },
  description: "Talotekninen rakennuttaminen, valvonta, LVI-suunnittelu ja liike- sekä toimitilojen vuokraus Jyväskylässä.",
  alternates: { canonical: "/" },
  openGraph: {
    locale: "fi_FI",
    type: "website",
    siteName: "JKP Group Oy",
    title: "JKP Group Oy | Talotekniikka ja toimitilat",
    description: "Kokenut talotekniikan asiantuntija ja joustava toimitilakumppani Keski-Suomessa.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "JKP Group Oy",
    url: siteUrl,
    email: "jari.koskela@jkpgroup.fi",
    areaServed: "Keski-Suomi",
    foundingDate: "1993",
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
