"use client";

import { FormEvent, ReactNode, useRef, useState } from "react";

type FormStatus = "idle" | "loading" | "success" | "error";

type ContactResponse = {
  message?: string;
  delivery?: "resend" | "mailto";
  mailtoUrl?: string;
};

type RentalFormProps = {
  subject: string;
  submitLabel: string;
  children: ReactNode;
};

function RentalForm({ subject, submitLabel, children }: RentalFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
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
      const payload = (await response.json()) as ContactResponse;
      if (!response.ok) throw new Error(payload.message || "Lomakkeen lähetys epäonnistui.");

      form.reset();
      startedAt.current = Date.now();
      setStatus("success");

      if (payload.delivery === "mailto" && payload.mailtoUrl) {
        setMessage(payload.message || "Sähköpostiohjelma avataan.");
        window.location.assign(payload.mailtoUrl);
        return;
      }

      setMessage(payload.message || "Kiitos. Tiedot on vastaanotettu.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Lomakkeen lähetys epäonnistui.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      {children}
      <label className="honeypot" aria-hidden="true">
        Verkkosivu
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="privacy-row">
        <input name="privacyConsent" type="checkbox" value="Hyväksytty" required />
        Hyväksyn tietojen käsittelyn yhteydenottoa ja hakemuksen käsittelyä varten.
      </label>
      <button className="button button-submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Lähetetään…" : submitLabel}
      </button>
      {message ? <p className={`form-status ${status}`} role="status">{message}</p> : null}
    </form>
  );
}

export function BusinessPremisesForm() {
  return (
    <RentalForm subject="B2B-toimitilan tarjouspyyntö" submitLabel="Lähetä tilakysely">
      <div className="form-row">
        <label>Yritys<input name="company" autoComplete="organization" required maxLength={160} /></label>
        <label>Y-tunnus<input name="businessId" maxLength={20} /></label>
      </div>
      <div className="form-row">
        <label>Yhteyshenkilö<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>Puhelin<input name="phone" type="tel" autoComplete="tel" required maxLength={40} /></label>
      </div>
      <label>Sähköposti<input name="email" type="email" autoComplete="email" required maxLength={180} /></label>
      <div className="form-row">
        <label>Tilatyyppi<input name="spaceType" required maxLength={120} placeholder="Esim. toimisto, liiketila tai varasto" /></label>
        <label>Tarvittava pinta-ala<input name="areaNeed" required maxLength={80} placeholder="Esim. 150–250 m²" /></label>
      </div>
      <div className="form-row">
        <label>Toivottu sijainti<input name="preferredLocation" required maxLength={160} /></label>
        <label>Aloitusajankohta<input name="startDate" type="date" /></label>
      </div>
      <label>Käyttötarkoitus ja lisätiedot<textarea name="message" required minLength={10} maxLength={3000} rows={6} /></label>
    </RentalForm>
  );
}

export function ApartmentApplicationForm() {
  return (
    <RentalForm subject="Asuntovuokrauksen hakemus" submitLabel="Lähetä vuokrahakemus">
      <div className="form-row">
        <label>Hakijan nimi<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>Puhelin<input name="phone" type="tel" autoComplete="tel" required maxLength={40} /></label>
      </div>
      <label>Sähköposti<input name="email" type="email" autoComplete="email" required maxLength={180} /></label>
      <label>Haettava kohde<input name="property" required maxLength={180} placeholder="Kohteen osoite tai ilmoituksen nimi" /></label>
      <div className="form-row">
        <label>Asukkaiden määrä<input name="occupants" type="number" min="1" max="20" required /></label>
        <label>Toivottu muuttopäivä<input name="moveInDate" type="date" required /></label>
      </div>
      <div className="form-row">
        <label>Arvioitu asumisen kesto<input name="rentalDuration" required maxLength={100} placeholder="Esim. toistaiseksi" /></label>
        <label>Lemmikit<input name="pets" maxLength={180} placeholder="Ei / kyllä, mikä eläin" /></label>
      </div>
      <label>Tupakointi<select name="smoking" required defaultValue=""><option value="" disabled>Valitse</option><option value="Ei">Ei</option><option value="Kyllä">Kyllä</option></select></label>
      <label>Lisätiedot<textarea name="message" required minLength={10} maxLength={3000} rows={6} placeholder="Kerro lyhyesti hakemuksen kannalta olennaiset lisätiedot. Älä kirjoita henkilötunnusta tai muita arkaluonteisia tietoja." /></label>
      <p>Älä lisää lomakkeelle henkilötunnusta, pankkitietoja tai luottotietoja koskevia asiakirjoja.</p>
    </RentalForm>
  );
}
