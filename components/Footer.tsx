import Link from "next/link";
import type { SiteContent } from "@/content/defaults";

export function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="footer-brand">JKP Group Oy</div>
          <p>Talotekninen asiantuntijapalvelu ja liike- sekä toimitilojen vuokraus.</p>
        </div>
        <div>
          <strong>Palvelut</strong>
          <Link href="/talotekniikka">Talotekniikka</Link>
          <Link href="/vuokraus">Vuokraus</Link>
          <Link href="/referenssit">Referenssit</Link>
        </div>
        <div>
          <strong>Yhteys</strong>
          <a href={`mailto:${content.company.email}`}>{content.company.email}</a>
          {content.company.phone ? <a href={`tel:${content.company.phone.replace(/\s/g, "")}`}>{content.company.phone}</a> : null}
          <span>{content.company.area}</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} JKP Group Oy</span>
        <span>Y-tunnus 0923519-9</span>
      </div>
    </footer>
  );
}
