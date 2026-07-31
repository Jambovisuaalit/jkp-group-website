"use client";

import { FormEvent, useRef, useState } from "react";

export function ContactForm({ subject = "Yhteydenotto verkkosivulta" }: { subject?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef(Date.now());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, subject, startedAt: startedAt.current }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message || "Viestin lähetys epäonnistui.");
      form.reset();
      startedAt.current = Date.now();
      setStatus("success");
      setMessage("Kiitos. Viesti on vastaanotettu.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Viestin lähetys epäonnistui.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>Nimi<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>Sähköposti<input name="email" type="email" autoComplete="email" required maxLength={180} /></label>
      </div>
      <div className="form-row">
        <label>Yritys<input name="company" autoComplete="organization" maxLength={120} /></label>
        <label>Puhelin<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
      </div>
      <label>Viesti<textarea name="message" required minLength={10} maxLength={3000} rows={6} /></label>
      <label className="honeypot" aria-hidden="true">Verkkosivu<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="privacy-row">
        <input name="privacyConsent" type="checkbox" value="Hyväksytty" required />
        Hyväksyn tietojeni käsittelyn yhteydenottoon vastaamista varten.
      </label>
      <button className="button button-submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Lähetetään…" : "Lähetä viesti"}
      </button>
      {message ? <p className={`form-status ${status}`} role="status">{message}</p> : null}
    </form>
  );
}
