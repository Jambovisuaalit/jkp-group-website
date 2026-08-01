import Link from "next/link";

export function Header({ email }: { email: string }) {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/" aria-label="JKP Group Oy etusivu">
          <span className="brand-mark" aria-hidden="true">JKP</span>
          <span className="brand-copy">
            <strong>JKP Group Oy</strong>
            <small>Talotekniikka · Kiinteistöt</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Päänavigaatio">
          <Link href="/talotekniikka">Talotekniikka</Link>
          <Link href="/vuokraus">Vuokraus</Link>
          <Link href="/referenssit">Referenssit</Link>
        </nav>

        <a className="button button-small header-contact" href={`mailto:${email}`}>
          Ota yhteyttä <span aria-hidden="true">↗</span>
        </a>

        <details className="mobile-menu">
          <summary aria-label="Avaa sivuston valikko">
            <span>Valikko</span>
            <span className="mobile-menu-icon" aria-hidden="true" />
          </summary>
          <nav className="mobile-nav" aria-label="Mobiilinavigaatio">
            <Link href="/talotekniikka">Talotekniikka</Link>
            <Link href="/vuokraus">Vuokraus</Link>
            <Link href="/referenssit">Referenssit</Link>
            <a className="mobile-nav-contact" href={`mailto:${email}`}>Ota yhteyttä</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
