"use client";

import { FormEvent, useRef, useState } from "react";

type ContactResponse = {
  message?: string;
  delivery?: "resend" | "mailto";
  mailtoUrl?: string;
};

export function ContactForm({ subject = "Yhteydenotto verkkosivulta" }: { subject?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef(0);

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
        body: JSON.stringify({
          ...data,
          privacyConsent: data.privacyConsent === "Hyväksytty",
          subject,
          startedAt: startedAt.current,
        }),
      });
      const payload = (await response.json()) as ContactResponse;
      if (!response.ok) throw new Error(payload.message || "Viestin lähetys epäonnistui.");

      form.reset();
      startedAt.current = 0;
      setStatus("success");

      if (payload.delivery === "mailto" && payload.mailtoUrl) {
        setMessage(payload.message || "Sähköpostiohjelma avataan.");
        window.location.assign(payload.mailtoUrl);
        return;
      }

      setMessage(payload.message || "Kiitos. Viesti on vastaanotettu.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Viestin lähetys epäonnistui.");
    }
  }

  return (
    <form className="contact-form" onFocus={() => { if (!startedAt.current) startedAt.current = Date.now(); }} onSubmit={submit}>
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
