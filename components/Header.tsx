import Link from "next/link";

export function Header({ email }: { email: string }) {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/" aria-label="JKP Group Oy etusivu">
          <span className="brand-mark">JKP</span>
          <span className="brand-copy"><strong>JKP Group</strong><small>Talotekniikka · Tilat</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Päänavigaatio">
          <Link href="/talotekniikka">Talotekniikka</Link>
          <Link href="/vuokraus">Vuokraus</Link>
          <Link href="/referenssit">Referenssit</Link>
        </nav>
        <a className="button button-small" href={`mailto:${email}`}>Ota yhteyttä</a>
      </div>
    </header>
  );
}
