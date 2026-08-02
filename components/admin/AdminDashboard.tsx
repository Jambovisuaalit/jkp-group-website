"use client";

/* Admin previews already receive bounded, optimized WebP assets from the media API. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SiteContent } from "@/content/defaults";
import type {
  AdminReference,
  AdminRental,
  AdminSubmission,
  PublicationState,
  SubmissionStatus,
} from "@/types/admin";
import styles from "./AdminDashboard.module.css";

type View =
  | "overview"
  | "rentals"
  | "references"
  | "home-content"
  | "tech-content"
  | "contact-content"
  | "submissions"
  | "account";

type SessionUser = { id: string; email?: string };
type Notice = { kind: "success" | "error" | "info"; message: string } | null;

type ApiError = Error & { status?: number };

const rentalLabels: Record<AdminRental["type"], string> = {
  holiday: "Loma-asunto / kiinteistö",
  commercial: "Liike- tai toimitila",
  residential: "Vuokra-asunto",
};

const availabilityLabels: Record<AdminRental["availability"], string> = {
  available: "Vapaa",
  occupied: "Varattu",
  always_active: "Jatkuvasti näkyvä",
};

const publicationLabels: Record<PublicationState, string> = {
  draft: "Luonnos",
  published: "Julkaistu",
  hidden: "Piilotettu",
};

const submissionKindLabels: Record<AdminSubmission["kind"], string> = {
  contact: "Yhteydenotto",
  commercial: "Toimitilakysely",
  residential: "Vuokrahakemus",
};

const submissionStatusLabels: Record<SubmissionStatus, string> = {
  new: "Uusi",
  contacted: "Kontaktoitu",
  processed: "Käsitelty",
  archived: "Arkistoitu",
  spam: "Roskaposti",
};

function emptyRental(): AdminRental {
  return {
    id: "",
    slug: "",
    title: "",
    type: "commercial",
    availability: "available",
    city: "Jyväskylä",
    address: "",
    summary: "",
    description: "",
    price: "",
    area: "",
    rooms: "",
    mainImage: "",
    gallery: [],
    details: [],
    highlights: [],
    contactName: "JKP Group Oy",
    publicationState: "draft",
    sortOrder: 100,
    createdAt: "",
    updatedAt: "",
  };
}

function emptyReference(): AdminReference {
  return {
    id: "",
    title: "",
    category: "Talotekniikka",
    location: "",
    year: String(new Date().getFullYear()),
    role: "",
    summary: "",
    description: "",
    imageUrl: "",
    gallery: [],
    permissionConfirmed: false,
    publicationState: "draft",
    sortOrder: 100,
    createdAt: "",
    updatedAt: "",
  };
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: options?.body instanceof FormData
      ? options.headers
      : { "Content-Type": "application/json", ...options?.headers },
  });

  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    const error = new Error(payload.message || "Toiminto epäonnistui.") as ApiError;
    error.status = response.status;
    throw error;
  }
  return payload;
}

function formatDate(value: string, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function listToText(items: string[]) {
  return items.join("\n");
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  hint,
  children,
  wide = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? styles.fieldWide : styles.field}>
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function StatusBadge({ state }: { state: PublicationState }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${state}`]}`}>
      {publicationLabels[state]}
    </span>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    building: <><path d="M4 21V5l8-3v19"/><path d="M12 8h8v13"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/></>,
    reference: <><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2.5"/><path d="M8 7h6M8 11h7"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    inbox: <><path d="M4 4h16v13H4z"/><path d="M4 13h5l2 3h2l2-3h5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-6"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></>,
  };
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.overview}
    </svg>
  );
}

export function AdminDashboard({ enabled }: { enabled: boolean }) {
  const [sessionState, setSessionState] = useState<"checking" | "signed-out" | "signed-in">("checking");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [view, setView] = useState<View>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [rentals, setRentals] = useState<AdminRental[]>([]);
  const [references, setReferences] = useState<AdminReference[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);

  const [rentalFilter, setRentalFilter] = useState<PublicationState | "all">("all");
  const [rentalSearch, setRentalSearch] = useState("");
  const [rentalDraft, setRentalDraft] = useState<AdminRental | null>(null);
  const [referenceDraft, setReferenceDraft] = useState<AdminReference | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);

  const showNotice = useCallback((next: Notice) => {
    setNotice(next);
    if (next) window.setTimeout(() => setNotice(null), 4200);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rentalData, referenceData, submissionData, contentData] = await Promise.all([
        api<{ items: AdminRental[] }>("/api/admin/rentals"),
        api<{ items: AdminReference[] }>("/api/admin/references"),
        api<{ items: AdminSubmission[] }>("/api/admin/submissions"),
        api<SiteContent>("/api/admin/content"),
      ]);
      setRentals(rentalData.items);
      setReferences(referenceData.items);
      setSubmissions(submissionData.items);
      setContent(contentData);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        setSessionState("signed-out");
        setUser(null);
      }
      showNotice({ kind: "error", message: apiError.message });
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    void (async () => {
      if (!enabled) {
        setSessionState("signed-out");
        return;
      }
      try {
        const data = await api<{ user: SessionUser }>("/api/admin/session");
        setUser(data.user);
        setSessionState("signed-in");
        await loadData();
      } catch {
        setSessionState("signed-out");
      }
    })();
  }, [enabled, loadData]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const data = await api<{ user: SessionUser }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || ""),
        }),
      });
      setUser(data.user);
      setSessionState("signed-in");
      showNotice({ kind: "success", message: "Kirjautuminen onnistui." });
      await loadData();
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await api<{ ok: true }>("/api/admin/session", { method: "DELETE" });
    setSessionState("signed-out");
    setUser(null);
    setRentals([]);
    setReferences([]);
    setSubmissions([]);
    setContent(null);
  }

  async function uploadImage(file: File, folder: string) {
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    const data = await api<{ url: string }>("/api/admin/media", {
      method: "POST",
      body: form,
    });
    return data.url;
  }

  async function saveRental(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rentalDraft) return;
    setLoading(true);
    try {
      const isNew = !rentalDraft.id;
      const data = await api<{ item: AdminRental }>(
        isNew ? "/api/admin/rentals" : `/api/admin/rentals/${rentalDraft.id}`,
        { method: isNew ? "POST" : "PUT", body: JSON.stringify(rentalDraft) },
      );
      setRentals((items) => [data.item, ...items.filter((item) => item.id !== data.item.id)]);
      setRentalDraft(null);
      showNotice({ kind: "success", message: isNew ? "Vuokrakohde lisättiin." : "Vuokrakohde päivitettiin." });
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function deleteRental(item: AdminRental) {
    if (!window.confirm(`Poistetaanko vuokrakohde “${item.title}” pysyvästi?`)) return;
    setLoading(true);
    try {
      await api<{ ok: true }>(`/api/admin/rentals/${item.id}`, { method: "DELETE" });
      setRentals((items) => items.filter((candidate) => candidate.id !== item.id));
      setRentalDraft(null);
      showNotice({ kind: "success", message: "Vuokrakohde poistettiin." });
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function saveReference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!referenceDraft) return;
    setLoading(true);
    try {
      const isNew = !referenceDraft.id;
      const data = await api<{ item: AdminReference }>(
        isNew ? "/api/admin/references" : `/api/admin/references/${referenceDraft.id}`,
        { method: isNew ? "POST" : "PUT", body: JSON.stringify(referenceDraft) },
      );
      setReferences((items) => [data.item, ...items.filter((item) => item.id !== data.item.id)]);
      setReferenceDraft(null);
      showNotice({ kind: "success", message: isNew ? "Referenssi lisättiin." : "Referenssi päivitettiin." });
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function deleteReference(item: AdminReference) {
    if (!window.confirm(`Poistetaanko referenssi “${item.title}” pysyvästi?`)) return;
    setLoading(true);
    try {
      await api<{ ok: true }>(`/api/admin/references/${item.id}`, { method: "DELETE" });
      setReferences((items) => items.filter((candidate) => candidate.id !== item.id));
      setReferenceDraft(null);
      showNotice({ kind: "success", message: "Referenssi poistettiin." });
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content) return;
    setLoading(true);
    try {
      await api<{ message: string }>("/api/admin/content", {
        method: "PUT",
        body: JSON.stringify(content),
      });
      showNotice({ kind: "success", message: "Sivuston sisältö tallennettiin." });
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function updateSubmissionStatus(item: AdminSubmission, status: SubmissionStatus) {
    setLoading(true);
    try {
      const data = await api<{ item: AdminSubmission }>(`/api/admin/submissions/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setSubmissions((items) => items.map((candidate) => candidate.id === item.id ? data.item : candidate));
      setSelectedSubmission(data.item);
      showNotice({ kind: "success", message: "Viestin käsittelytila päivitettiin." });
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (newPassword !== confirmation) {
      showNotice({ kind: "error", message: "Uudet salasanat eivät täsmää." });
      return;
    }
    setLoading(true);
    try {
      const result = await api<{ message: string }>("/api/admin/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: String(form.get("currentPassword") || ""),
          newPassword,
        }),
      });
      event.currentTarget.reset();
      showNotice({ kind: "success", message: result.message });
    } catch (error) {
      showNotice({ kind: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  const filteredRentals = useMemo(() => {
    const query = rentalSearch.trim().toLowerCase();
    return rentals.filter((item) => {
      const stateMatch = rentalFilter === "all" || item.publicationState === rentalFilter;
      const textMatch = !query || `${item.title} ${item.city} ${item.address}`.toLowerCase().includes(query);
      return stateMatch && textMatch;
    });
  }, [rentals, rentalFilter, rentalSearch]);

  const recentItems = useMemo(() => {
    return [
      ...rentals.map((item) => ({ type: "Vuokrakohde", title: item.title, date: item.updatedAt })),
      ...references.map((item) => ({ type: "Referenssi", title: item.title, date: item.updatedAt })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [rentals, references]);

  const newSubmissions = submissions.filter((item) => item.status === "new").length;
  const publishedRentals = rentals.filter((item) => item.publicationState === "published").length;

  function navigate(next: View) {
    setView(next);
    setMobileMenu(false);
  }

  if (sessionState === "checking") {
    return <div className={styles.loadingScreen}><span className={styles.spinner} />Tarkistetaan istuntoa…</div>;
  }

  if (sessionState === "signed-out") {
    return (
      <main className={styles.loginPage}>
        <section className={styles.loginPanel}>
          <div className={styles.loginBrand}>
            <span>JKP</span>
            <div><strong>JKP Hallinta</strong><small>Sisällönhallintajärjestelmä</small></div>
          </div>
          <p className={styles.loginEyebrow}>Suojattu hallintapaneeli</p>
          <h1>Kirjaudu hallintaan</h1>
          <p className={styles.loginLead}>Lisää vuokrakohteita, julkaise referenssejä ja päivitä sivuston sisältöä.</p>
          {!enabled ? (
            <div className={styles.setupWarning}>
              Hallinta aktivoituu, kun JKP:n oma Supabase-projekti ja ympäristömuuttujat on kytketty.
            </div>
          ) : (
            <form className={styles.loginForm} onSubmit={login}>
              <Field label="Sähköposti">
                <input name="email" type="email" autoComplete="username" defaultValue="jari.koskela@jkpgroup.fi" required />
              </Field>
              <Field label="Salasana">
                <input name="password" type="password" autoComplete="current-password" required />
              </Field>
              <button className={styles.primaryButton} disabled={loading} type="submit">
                {loading ? "Kirjaudutaan…" : "Kirjaudu"}
              </button>
            </form>
          )}
          <Link className={styles.backLink} href="/">← Takaisin verkkosivustolle</Link>
        </section>
        <aside className={styles.loginVisual} aria-hidden="true">
          <span>JKP / ADMIN</span>
          <strong>Selkeä hallinta.<br />Ajantasainen sivusto.</strong>
          <div className={styles.loginMetric}><b>01</b><small>Yksi turvallinen sisältölähde</small></div>
        </aside>
        {notice ? <div className={`${styles.toast} ${styles[`toast_${notice.kind}`]}`}>{notice.message}</div> : null}
      </main>
    );
  }

  const navItems: Array<{ section?: string; view: View; label: string; icon: string }> = [
    { view: "overview", label: "Yhteenveto", icon: "overview" },
    { section: "SISÄLTÖ", view: "rentals", label: "Vuokrakohteet", icon: "building" },
    { view: "references", label: "Referenssit", icon: "reference" },
    { section: "SIVUSTO", view: "home-content", label: "Etusivu", icon: "edit" },
    { view: "tech-content", label: "Talotekniikka", icon: "edit" },
    { view: "contact-content", label: "Yhteystiedot", icon: "edit" },
    { section: "ASIOINTI", view: "submissions", label: "Lomakeviestit", icon: "inbox" },
    { section: "ASETUKSET", view: "account", label: "Oma tili", icon: "user" },
  ];

  return (
    <main className={styles.app}>
      <aside className={`${styles.sidebar} ${mobileMenu ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarBrand}>
          <span>JKP</span>
          <div><strong>JKP Hallinta</strong><small>jkpgroup.fi</small></div>
          <button className={styles.mobileClose} onClick={() => setMobileMenu(false)} aria-label="Sulje valikko"><Icon name="close" /></button>
        </div>
        <nav className={styles.sidebarNav} aria-label="Hallinnan navigaatio">
          {navItems.map((item, index) => (
            <div key={item.view}>
              {item.section ? <p className={styles.navSection}>{item.section}</p> : index === 0 ? null : null}
              <button className={view === item.view ? styles.navActive : ""} onClick={() => navigate(item.view)}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.view === "submissions" && newSubmissions > 0 ? <b>{newSubmissions}</b> : null}
              </button>
            </div>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <a href="/" target="_blank" rel="noreferrer"><Icon name="external" />Avaa sivusto</a>
          <button onClick={() => void logout()}><Icon name="logout" />Kirjaudu ulos</button>
        </div>
      </aside>

      {mobileMenu ? <button className={styles.overlay} onClick={() => setMobileMenu(false)} aria-label="Sulje valikko" /> : null}

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenuButton} onClick={() => setMobileMenu(true)} aria-label="Avaa valikko"><Icon name="menu" /></button>
          <div>
            <p>{new Intl.DateTimeFormat("fi-FI", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
            <strong>{user?.email}</strong>
          </div>
          <span className={styles.systemStatus}><i /> Järjestelmä käytössä</span>
        </header>

        <div className={styles.contentArea}>
          {view === "overview" ? (
            <section>
              <div className={styles.pageHeading}>
                <div><p className={styles.kicker}>YHTEENVETO</p><h1>Hyvää päivää, Jari.</h1><p>Hallinnoi JKP Groupin verkkosivuston sisältöjä yhdestä paikasta.</p></div>
                <button className={styles.primaryButton} onClick={() => { setRentalDraft(emptyRental()); navigate("rentals"); }}><Icon name="plus" />Lisää vuokrakohde</button>
              </div>
              <div className={styles.statsGrid}>
                <article><span>Julkaistut vuokrakohteet</span><strong>{publishedRentals}</strong><small>{rentals.length} kohdetta yhteensä</small></article>
                <article><span>Uudet yhteydenotot</span><strong>{newSubmissions}</strong><small>{submissions.length} viestiä yhteensä</small></article>
                <article><span>Julkaistut referenssit</span><strong>{references.filter((item) => item.publicationState === "published").length}</strong><small>{references.length} referenssiä yhteensä</small></article>
              </div>
              <div className={styles.dashboardGrid}>
                <section className={styles.panel}>
                  <div className={styles.panelHeading}><div><p className={styles.kicker}>VIIMEKSI PÄIVITETTY</p><h2>Sisältömuutokset</h2></div></div>
                  {recentItems.length ? <div className={styles.activityList}>{recentItems.map((item, index) => <div key={`${item.type}-${item.title}-${index}`}><span>{item.type.slice(0, 1)}</span><div><strong>{item.title}</strong><small>{item.type}</small></div><time>{formatDate(item.date, true)}</time></div>)}</div> : <div className={styles.emptyState}>Ei vielä tallennettuja sisältömuutoksia.</div>}
                </section>
                <section className={styles.panel}>
                  <div className={styles.panelHeading}><div><p className={styles.kicker}>PIKATOIMINNOT</p><h2>Yleisimmät tehtävät</h2></div></div>
                  <div className={styles.quickActions}>
                    <button onClick={() => { setRentalDraft(emptyRental()); navigate("rentals"); }}><Icon name="building" /><span><strong>Lisää vuokrakohde</strong><small>Luo uusi luonnos</small></span>→</button>
                    <button onClick={() => { setReferenceDraft(emptyReference()); navigate("references"); }}><Icon name="reference" /><span><strong>Lisää referenssi</strong><small>Dokumentoi valmistunut projekti</small></span>→</button>
                    <button onClick={() => navigate("home-content")}><Icon name="edit" /><span><strong>Muokkaa etusivua</strong><small>Päivitä pääviesti tai kuva</small></span>→</button>
                  </div>
                </section>
              </div>
            </section>
          ) : null}

          {view === "rentals" ? (
            <section>
              <div className={styles.pageHeading}>
                <div><p className={styles.kicker}>VUOKRAKOHTEET</p><h1>Vuokrakohteet</h1><p>Lisää, julkaise ja piilota kohteita ilman teknistä osaamista.</p></div>
                <button className={styles.primaryButton} onClick={() => setRentalDraft(emptyRental())}><Icon name="plus" />Lisää uusi</button>
              </div>
              <div className={styles.toolbar}>
                <div className={styles.tabs}>{(["all", "published", "draft", "hidden"] as const).map((state) => <button key={state} className={rentalFilter === state ? styles.tabActive : ""} onClick={() => setRentalFilter(state)}>{state === "all" ? "Kaikki" : publicationLabels[state]} <b>{state === "all" ? rentals.length : rentals.filter((item) => item.publicationState === state).length}</b></button>)}</div>
                <input className={styles.searchInput} value={rentalSearch} onChange={(event) => setRentalSearch(event.target.value)} placeholder="Hae nimellä tai paikkakunnalla" />
              </div>
              <div className={styles.tablePanel}>
                <div className={styles.tableHeader}><span>Kohde</span><span>Tyyppi</span><span>Saatavuus</span><span>Tila</span><span>Päivitetty</span><span /></div>
                {filteredRentals.map((item) => (
                  <button className={styles.tableRow} key={item.id} onClick={() => setRentalDraft({ ...item })}>
                    <span className={styles.itemIdentity}>{item.mainImage ? <img src={item.mainImage} alt="" /> : <i>{item.title.slice(0, 1) || "K"}</i>}<span><strong>{item.title}</strong><small>{item.city || item.address || "Sijainti puuttuu"}</small></span></span>
                    <span>{rentalLabels[item.type]}</span><span>{availabilityLabels[item.availability]}</span><span><StatusBadge state={item.publicationState} /></span><span>{formatDate(item.updatedAt)}</span><span>Muokkaa →</span>
                  </button>
                ))}
                {!filteredRentals.length ? <div className={styles.emptyState}>Hakuehdoilla ei löytynyt kohteita.</div> : null}
              </div>
            </section>
          ) : null}

          {view === "references" ? (
            <section>
              <div className={styles.pageHeading}>
                <div><p className={styles.kicker}>REFERENSSIT</p><h1>Referenssit</h1><p>Julkaise vain asiakkaan hyväksymät projektit ja kuvat.</p></div>
                <button className={styles.primaryButton} onClick={() => setReferenceDraft(emptyReference())}><Icon name="plus" />Lisää referenssi</button>
              </div>
              <div className={styles.cardGrid}>
                {references.map((item) => <button className={styles.referenceCard} key={item.id} onClick={() => setReferenceDraft({ ...item })}>{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className={styles.imagePlaceholder}>JKP</div>}<div><StatusBadge state={item.publicationState} /><h2>{item.title}</h2><p>{[item.category, item.location, item.year].filter(Boolean).join(" · ") || "Tiedot täydentämättä"}</p><small>{item.permissionConfirmed ? "Julkaisulupa vahvistettu" : "Julkaisulupa puuttuu"}</small></div></button>)}
                {!references.length ? <div className={styles.emptyState}>Referenssejä ei ole vielä lisätty.</div> : null}
              </div>
            </section>
          ) : null}

          {(view === "home-content" || view === "tech-content" || view === "contact-content") && content ? (
            <form onSubmit={saveContent}>
              <div className={styles.pageHeading}>
                <div><p className={styles.kicker}>SIVUSTON SISÄLTÖ</p><h1>{view === "home-content" ? "Etusivu" : view === "tech-content" ? "Talotekniikka" : "Yhteystiedot"}</h1><p>Muuta vain vahvistettuja tekstejä ja kuvia. Sivuston rakennetta ei voi rikkoa tästä näkymästä.</p></div>
                <button className={styles.primaryButton} disabled={loading} type="submit">Tallenna muutokset</button>
              </div>
              <section className={styles.editorPanel}>
                {view === "home-content" ? <>
                  <div className={styles.editorSection}><p className={styles.kicker}>PÄÄVIESTI</p><h2>Etusivun hero</h2><div className={styles.formGrid}>
                    <Field label="Yläotsikko" wide><input value={content.hero.eyebrow} onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrow: e.target.value } })} /></Field>
                    <Field label="Pääotsikko" wide><textarea rows={3} value={content.hero.title} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} /></Field>
                    <Field label="Ingressi" wide><textarea rows={4} value={content.hero.lead} onChange={(e) => setContent({ ...content, hero: { ...content.hero, lead: e.target.value } })} /></Field>
                    <Field label="Hero-kuva" hint="JPEG, PNG tai WebP. Kuva muunnetaan automaattisesti WebP-muotoon." wide><div className={styles.imageField}>{content.hero.imageUrl ? <img src={content.hero.imageUrl} alt="Nykyinen hero" /> : <span>Ei kuvaa</span>}<label className={styles.uploadButton}><Icon name="upload" />Vaihda kuva<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void (async () => { const file = event.target.files?.[0]; if (!file) return; try { setLoading(true); const url = await uploadImage(file, "site"); setContent({ ...content, hero: { ...content.hero, imageUrl: url } }); showNotice({ kind: "info", message: "Kuva ladattiin. Tallenna muutokset julkaistaksesi sen." }); } catch (error) { showNotice({ kind: "error", message: (error as Error).message }); } finally { setLoading(false); } })()} /></label></div></Field>
                  </div></div>
                  <div className={styles.editorSection}><p className={styles.kicker}>YRITYSESITTELY</p><h2>Yrityksestä</h2><div className={styles.formGrid}><Field label="Otsikko" wide><input value={content.about.title} onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })} /></Field><Field label="Esittelyteksti" wide><textarea rows={6} value={content.about.body} onChange={(e) => setContent({ ...content, about: { ...content.about, body: e.target.value } })} /></Field></div></div>
                </> : null}
                {view === "tech-content" ? <div className={styles.editorSection}><p className={styles.kicker}>PALVELUT</p><h2>Talotekniikan palvelut</h2><div className={styles.serviceEditor}>{content.services.map((service, index) => <div key={index}><span>{String(index + 1).padStart(2, "0")}</span><Field label="Palvelun nimi"><input value={service.title} onChange={(e) => { const services = content.services.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item); setContent({ ...content, services }); }} /></Field><Field label="Kuvaus" wide><textarea rows={4} value={service.description} onChange={(e) => { const services = content.services.map((item, itemIndex) => itemIndex === index ? { ...item, description: e.target.value } : item); setContent({ ...content, services }); }} /></Field></div>)}</div></div> : null}
                {view === "contact-content" ? <>
                  <div className={styles.editorSection}><p className={styles.kicker}>YRITYSTIEDOT</p><h2>Yhteystiedot</h2><div className={styles.formGrid}><Field label="Yrityksen nimi"><input value={content.company.name} onChange={(e) => setContent({ ...content, company: { ...content.company, name: e.target.value } })} /></Field><Field label="Sähköposti"><input type="email" value={content.company.email} onChange={(e) => setContent({ ...content, company: { ...content.company, email: e.target.value } })} /></Field><Field label="Puhelin"><input value={content.company.phone} onChange={(e) => setContent({ ...content, company: { ...content.company, phone: e.target.value } })} /></Field><Field label="Toiminta-alue"><input value={content.company.area} onChange={(e) => setContent({ ...content, company: { ...content.company, area: e.target.value } })} /></Field></div></div>
                  <div className={styles.editorSection}><p className={styles.kicker}>YHTEYDENOTTO</p><h2>Yhteydenotto-osio</h2><div className={styles.formGrid}><Field label="Otsikko" wide><input value={content.contact.title} onChange={(e) => setContent({ ...content, contact: { ...content.contact, title: e.target.value } })} /></Field><Field label="Teksti" wide><textarea rows={4} value={content.contact.body} onChange={(e) => setContent({ ...content, contact: { ...content.contact, body: e.target.value } })} /></Field></div></div>
                </> : null}
              </section>
            </form>
          ) : null}

          {view === "submissions" ? (
            <section>
              <div className={styles.pageHeading}><div><p className={styles.kicker}>LOMAKEVIESTIT</p><h1>Saapuneet</h1><p>Yhteydenotot, toimitilakyselyt ja vuokra-asuntohakemukset.</p></div></div>
              <div className={styles.inboxLayout}>
                <div className={styles.messageList}>{submissions.map((item) => <button key={item.id} className={`${styles.messageItem} ${selectedSubmission?.id === item.id ? styles.messageSelected : ""}`} onClick={() => setSelectedSubmission(item)}><span className={item.status === "new" ? styles.unreadDot : ""} /><div><strong>{item.name}</strong><small>{submissionKindLabels[item.kind]} · {item.email}</small><p>{item.message}</p></div><time>{formatDate(item.createdAt)}</time></button>)}{!submissions.length ? <div className={styles.emptyState}>Lomakeviestejä ei ole vielä saapunut.</div> : null}</div>
                <aside className={styles.messageDetail}>{selectedSubmission ? <><div className={styles.messageDetailHeader}><div><p className={styles.kicker}>{submissionKindLabels[selectedSubmission.kind]}</p><h2>{selectedSubmission.name}</h2><p>{formatDate(selectedSubmission.createdAt, true)}</p></div><select value={selectedSubmission.status} onChange={(e) => void updateSubmissionStatus(selectedSubmission, e.target.value as SubmissionStatus)}>{Object.entries(submissionStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><dl><div><dt>Sähköposti</dt><dd><a href={`mailto:${selectedSubmission.email}`}>{selectedSubmission.email}</a></dd></div><div><dt>Puhelin</dt><dd>{selectedSubmission.phone || "—"}</dd></div>{selectedSubmission.company ? <div><dt>Yritys</dt><dd>{selectedSubmission.company}</dd></div> : null}{selectedSubmission.property ? <div><dt>Kohde</dt><dd>{selectedSubmission.property}</dd></div> : null}</dl><div className={styles.messageBody}>{selectedSubmission.message}</div><a className={styles.primaryButton} href={`mailto:${selectedSubmission.email}?subject=${encodeURIComponent("Re: Yhteydenotto JKP Groupille")}`}>Vastaa sähköpostilla</a></> : <div className={styles.emptyState}>Valitse viesti nähdäksesi sen tiedot.</div>}</aside>
              </div>
            </section>
          ) : null}

          {view === "account" ? (
            <section>
              <div className={styles.pageHeading}><div><p className={styles.kicker}>OMA TILI</p><h1>Käyttäjätili</h1><p>Hallinnoi kirjautumistietojasi turvallisesti.</p></div></div>
              <div className={styles.accountGrid}>
                <section className={styles.panel}><p className={styles.kicker}>KÄYTTÄJÄ</p><h2>Jari Koskela</h2><dl className={styles.accountDetails}><div><dt>Sähköposti</dt><dd>{user?.email}</dd></div><div><dt>Rooli</dt><dd>Pääkäyttäjä</dd></div><div><dt>Käyttöoikeus</dt><dd>Aktiivinen</dd></div></dl></section>
                <form className={styles.panel} onSubmit={changePassword}><p className={styles.kicker}>TIETOTURVA</p><h2>Vaihda salasana</h2><div className={styles.formStack}><Field label="Nykyinen salasana"><input name="currentPassword" type="password" autoComplete="current-password" required /></Field><Field label="Uusi salasana" hint="Vähintään 12 merkkiä"><input name="newPassword" type="password" autoComplete="new-password" minLength={12} required /></Field><Field label="Uusi salasana uudelleen"><input name="confirmation" type="password" autoComplete="new-password" minLength={12} required /></Field><button className={styles.primaryButton} disabled={loading} type="submit">Vaihda salasana</button></div></form>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {rentalDraft ? (
        <div className={styles.drawerBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRentalDraft(null); }}>
          <form className={styles.drawer} onSubmit={saveRental}>
            <header><div><p className={styles.kicker}>{rentalDraft.id ? "MUOKKAA KOHDETTA" : "UUSI VUOKRAKOHDE"}</p><h2>{rentalDraft.id ? rentalDraft.title : "Lisää vuokrakohde"}</h2></div><button type="button" onClick={() => setRentalDraft(null)} aria-label="Sulje"><Icon name="close" /></button></header>
            <div className={styles.drawerBody}>
              <section><h3>Perustiedot</h3><div className={styles.formGrid}><Field label="Kohteen nimi" wide><input value={rentalDraft.title} onChange={(e) => setRentalDraft({ ...rentalDraft, title: e.target.value })} required /></Field><Field label="Kohdetyyppi"><select value={rentalDraft.type} onChange={(e) => setRentalDraft({ ...rentalDraft, type: e.target.value as AdminRental["type"] })}>{Object.entries(rentalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Saatavuus"><select value={rentalDraft.availability} onChange={(e) => setRentalDraft({ ...rentalDraft, availability: e.target.value as AdminRental["availability"] })}>{Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Paikkakunta"><input value={rentalDraft.city} onChange={(e) => setRentalDraft({ ...rentalDraft, city: e.target.value })} /></Field><Field label="Osoite"><input value={rentalDraft.address} onChange={(e) => setRentalDraft({ ...rentalDraft, address: e.target.value })} /></Field><Field label="Vuokra / hinta"><input value={rentalDraft.price} onChange={(e) => setRentalDraft({ ...rentalDraft, price: e.target.value })} placeholder="1 250 € / kk" /></Field><Field label="Pinta-ala"><input value={rentalDraft.area} onChange={(e) => setRentalDraft({ ...rentalDraft, area: e.target.value })} placeholder="85 m²" /></Field><Field label="Huoneet / tilat"><input value={rentalDraft.rooms} onChange={(e) => setRentalDraft({ ...rentalDraft, rooms: e.target.value })} /></Field><Field label="Verkko-osoite" hint="Jätä tyhjäksi, niin osoite luodaan nimestä"><input value={rentalDraft.slug} onChange={(e) => setRentalDraft({ ...rentalDraft, slug: e.target.value })} /></Field></div></section>
              <section><h3>Kuvaus</h3><div className={styles.formGrid}><Field label="Lyhyt esittely" wide><textarea rows={3} value={rentalDraft.summary} onChange={(e) => setRentalDraft({ ...rentalDraft, summary: e.target.value })} /></Field><Field label="Kohteen kuvaus" wide><textarea rows={7} value={rentalDraft.description} onChange={(e) => setRentalDraft({ ...rentalDraft, description: e.target.value })} /></Field><Field label="Ominaisuudet" hint="Yksi ominaisuus per rivi"><textarea rows={5} value={listToText(rentalDraft.highlights)} onChange={(e) => setRentalDraft({ ...rentalDraft, highlights: textToList(e.target.value) })} /></Field><Field label="Lisätiedot" hint="Yksi tieto per rivi"><textarea rows={5} value={listToText(rentalDraft.details)} onChange={(e) => setRentalDraft({ ...rentalDraft, details: textToList(e.target.value) })} /></Field></div></section>
              <section><h3>Kuvat</h3><div className={styles.imageManager}><div className={styles.mainImagePreview}>{rentalDraft.mainImage ? <img src={rentalDraft.mainImage} alt="Kohteen pääkuva" /> : <span>Ei pääkuvaa</span>}<label className={styles.uploadButton}><Icon name="upload" />{rentalDraft.mainImage ? "Vaihda pääkuva" : "Lisää pääkuva"}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void (async () => { const file = event.target.files?.[0]; if (!file) return; try { setLoading(true); const url = await uploadImage(file, "rentals"); setRentalDraft({ ...rentalDraft, mainImage: url }); } catch (error) { showNotice({ kind: "error", message: (error as Error).message }); } finally { setLoading(false); } })()} /></label></div><div className={styles.galleryGrid}>{rentalDraft.gallery.map((url, index) => <div key={`${url}-${index}`}><img src={url} alt="" /><button type="button" onClick={() => setRentalDraft({ ...rentalDraft, gallery: rentalDraft.gallery.filter((_, itemIndex) => itemIndex !== index) })}>×</button></div>)}<label className={styles.galleryAdd}><Icon name="plus" /><span>Lisää kuvia</span><input hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void (async () => { const files = Array.from(event.target.files || []); if (!files.length) return; try { setLoading(true); const urls: string[] = []; for (const file of files) urls.push(await uploadImage(file, "rentals")); setRentalDraft({ ...rentalDraft, gallery: [...rentalDraft.gallery, ...urls] }); } catch (error) { showNotice({ kind: "error", message: (error as Error).message }); } finally { setLoading(false); } })()} /></label></div></div></section>
              <section><h3>Julkaisu</h3><div className={styles.formGrid}><Field label="Julkaisutila"><select value={rentalDraft.publicationState} onChange={(e) => setRentalDraft({ ...rentalDraft, publicationState: e.target.value as PublicationState })}>{Object.entries(publicationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Järjestys"><input type="number" value={rentalDraft.sortOrder} onChange={(e) => setRentalDraft({ ...rentalDraft, sortOrder: Number(e.target.value) })} /></Field></div></section>
            </div>
            <footer><div>{rentalDraft.id ? <button className={styles.dangerButton} type="button" onClick={() => void deleteRental(rentalDraft)}><Icon name="trash" />Poista</button> : null}</div><div><button className={styles.secondaryButton} type="button" onClick={() => setRentalDraft(null)}>Peruuta</button><button className={styles.primaryButton} disabled={loading} type="submit">{loading ? "Tallennetaan…" : rentalDraft.publicationState === "published" ? "Tallenna ja julkaise" : "Tallenna"}</button></div></footer>
          </form>
        </div>
      ) : null}

      {referenceDraft ? (
        <div className={styles.drawerBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReferenceDraft(null); }}>
          <form className={styles.drawer} onSubmit={saveReference}>
            <header><div><p className={styles.kicker}>{referenceDraft.id ? "MUOKKAA REFERENSSIÄ" : "UUSI REFERENSSI"}</p><h2>{referenceDraft.id ? referenceDraft.title : "Lisää referenssi"}</h2></div><button type="button" onClick={() => setReferenceDraft(null)} aria-label="Sulje"><Icon name="close" /></button></header>
            <div className={styles.drawerBody}>
              <section><h3>Projektin tiedot</h3><div className={styles.formGrid}><Field label="Projektin nimi" wide><input value={referenceDraft.title} onChange={(e) => setReferenceDraft({ ...referenceDraft, title: e.target.value })} required /></Field><Field label="Kategoria"><input value={referenceDraft.category} onChange={(e) => setReferenceDraft({ ...referenceDraft, category: e.target.value })} /></Field><Field label="Paikkakunta"><input value={referenceDraft.location} onChange={(e) => setReferenceDraft({ ...referenceDraft, location: e.target.value })} /></Field><Field label="Vuosi"><input value={referenceDraft.year} onChange={(e) => setReferenceDraft({ ...referenceDraft, year: e.target.value })} /></Field><Field label="JKP Groupin rooli"><input value={referenceDraft.role} onChange={(e) => setReferenceDraft({ ...referenceDraft, role: e.target.value })} /></Field><Field label="Lyhyt esittely" wide><textarea rows={3} value={referenceDraft.summary} onChange={(e) => setReferenceDraft({ ...referenceDraft, summary: e.target.value })} /></Field><Field label="Projektikuvaus" wide><textarea rows={7} value={referenceDraft.description} onChange={(e) => setReferenceDraft({ ...referenceDraft, description: e.target.value })} /></Field></div></section>
              <section><h3>Kuvat</h3><div className={styles.mainImagePreview}>{referenceDraft.imageUrl ? <img src={referenceDraft.imageUrl} alt="Referenssin pääkuva" /> : <span>Ei pääkuvaa</span>}<label className={styles.uploadButton}><Icon name="upload" />{referenceDraft.imageUrl ? "Vaihda pääkuva" : "Lisää pääkuva"}<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void (async () => { const file = event.target.files?.[0]; if (!file) return; try { setLoading(true); const url = await uploadImage(file, "references"); setReferenceDraft({ ...referenceDraft, imageUrl: url }); } catch (error) { showNotice({ kind: "error", message: (error as Error).message }); } finally { setLoading(false); } })()} /></label></div></section>
              <section><h3>Julkaisu</h3><div className={styles.formGrid}><Field label="Julkaisutila"><select value={referenceDraft.publicationState} onChange={(e) => setReferenceDraft({ ...referenceDraft, publicationState: e.target.value as PublicationState })}>{Object.entries(publicationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Järjestys"><input type="number" value={referenceDraft.sortOrder} onChange={(e) => setReferenceDraft({ ...referenceDraft, sortOrder: Number(e.target.value) })} /></Field><Field label="Julkaisulupa" hint="Pakollinen ennen referenssin julkaisemista" wide><label className={styles.checkboxLabel}><input type="checkbox" checked={referenceDraft.permissionConfirmed} onChange={(e) => setReferenceDraft({ ...referenceDraft, permissionConfirmed: e.target.checked })} />Asiakkaan lupa tekstien ja kuvien julkaisuun on vahvistettu.</label></Field></div></section>
            </div>
            <footer><div>{referenceDraft.id ? <button className={styles.dangerButton} type="button" onClick={() => void deleteReference(referenceDraft)}><Icon name="trash" />Poista</button> : null}</div><div><button className={styles.secondaryButton} type="button" onClick={() => setReferenceDraft(null)}>Peruuta</button><button className={styles.primaryButton} disabled={loading} type="submit">{loading ? "Tallennetaan…" : referenceDraft.publicationState === "published" ? "Tallenna ja julkaise" : "Tallenna"}</button></div></footer>
          </form>
        </div>
      ) : null}

      {notice ? <div className={`${styles.toast} ${styles[`toast_${notice.kind}`]}`}>{notice.message}</div> : null}
      {loading && sessionState === "signed-in" ? <div className={styles.progressBar} /> : null}
    </main>
  );
}
