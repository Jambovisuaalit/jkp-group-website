"use client";

import { FormEvent, useEffect, useState } from "react";
import type { SiteContent } from "@/content/defaults";

export function AdminEditor() {
  const [authenticated, setAuthenticated] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState("");

  async function load() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (response.ok) {
      setAuthenticated(true);
      setContent((await response.json()) as SiteContent);
    }
  }

  useEffect(() => { void load(); }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Kirjaudutaan…");
    const password = String(new FormData(event.currentTarget).get("password") || "");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setStatus(payload.message || "Kirjautuminen epäonnistui.");
      return;
    }
    setStatus("");
    await load();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content) return;
    setStatus("Tallennetaan…");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const payload = (await response.json()) as { message?: string };
    setStatus(response.ok ? "Tallennettu. Muutokset näkyvät heti sivustolla." : payload.message || "Tallennus epäonnistui.");
  }

  async function uploadHeroImage(file: File | null) {
    if (!file || !content) return;
    setStatus("Ladataan kuvaa…");

    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body: formData });
    const payload = (await response.json()) as { message?: string; url?: string };

    if (!response.ok || !payload.url) {
      setStatus(payload.message || "Kuvan lataus epäonnistui.");
      return;
    }

    setContent({ ...content, hero: { ...content.hero, imageUrl: payload.url } });
    setStatus("Kuva ladattu. Tallenna muutokset ottaaksesi kuvan käyttöön.");
  }

  if (!authenticated || !content) {
    return (
      <form className="admin-login" onSubmit={login}>
        <label>Hallinnan salasana<input name="password" type="password" required autoComplete="current-password" /></label>
        <button className="button button-submit" type="submit">Kirjaudu</button>
        {status ? <p className="form-status">{status}</p> : null}
      </form>
    );
  }

  const updateService = (index: number, key: "title" | "description", value: string) => {
    const services = content.services.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
    setContent({ ...content, services });
  };

  return (
    <form className="admin-editor" onSubmit={save}>
      <section className="admin-card">
        <h2>Yrityksen tiedot</h2>
        <div className="form-row">
          <label>Sähköposti<input value={content.company.email} onChange={(e) => setContent({ ...content, company: { ...content.company, email: e.target.value } })} /></label>
          <label>Puhelin<input value={content.company.phone} onChange={(e) => setContent({ ...content, company: { ...content.company, phone: e.target.value } })} /></label>
        </div>
        <label>Toiminta-alue<input value={content.company.area} onChange={(e) => setContent({ ...content, company: { ...content.company, area: e.target.value } })} /></label>
      </section>

      <section className="admin-card">
        <h2>Etusivun pääviesti</h2>
        <label>Yläotsikko<input value={content.hero.eyebrow} onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrow: e.target.value } })} /></label>
        <label>Pääotsikko<textarea rows={2} value={content.hero.title} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} /></label>
        <label>Ingressi<textarea rows={4} value={content.hero.lead} onChange={(e) => setContent({ ...content, hero: { ...content.hero, lead: e.target.value } })} /></label>
        <label>Hero-kuvan URL<input type="url" value={content.hero.imageUrl} onChange={(e) => setContent({ ...content, hero: { ...content.hero, imageUrl: e.target.value } })} /></label>
        <label>Uusi hero-kuva<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadHeroImage(e.target.files?.[0] || null)} /></label>
        <p>JPEG, PNG tai WebP. Enimmäiskoko 6 Mt. Kuva tallennetaan JKP:n Supabase Storageen.</p>
      </section>

      <section className="admin-card">
        <h2>Yritysesittely</h2>
        <label>Otsikko<input value={content.about.title} onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })} /></label>
        <label>Teksti<textarea rows={5} value={content.about.body} onChange={(e) => setContent({ ...content, about: { ...content.about, body: e.target.value } })} /></label>
      </section>

      <section className="admin-card">
        <h2>Talotekniikan palvelut</h2>
        {content.services.map((service, index) => (
          <div className="admin-service" key={index}>
            <label>Palvelun nimi<input value={service.title} onChange={(e) => updateService(index, "title", e.target.value)} /></label>
            <label>Kuvaus<textarea rows={3} value={service.description} onChange={(e) => updateService(index, "description", e.target.value)} /></label>
          </div>
        ))}
      </section>

      <section className="admin-card">
        <h2>Yhteydenotto</h2>
        <label>Otsikko<input value={content.contact.title} onChange={(e) => setContent({ ...content, contact: { ...content.contact, title: e.target.value } })} /></label>
        <label>Teksti<textarea rows={3} value={content.contact.body} onChange={(e) => setContent({ ...content, contact: { ...content.contact, body: e.target.value } })} /></label>
      </section>

      <div className="admin-savebar">
        <button className="button button-submit" type="submit">Tallenna muutokset</button>
        <span>{status}</span>
      </div>
    </form>
  );
}
