"use client";

import { FormEvent, useEffect, useState } from "react";

const panelStyle = {
  width: "min(100% - 32px, 520px)",
  margin: "8vh auto",
  padding: "40px",
  border: "1px solid #d7d2c8",
  background: "#fff",
  boxShadow: "0 22px 60px rgba(26, 35, 32, 0.10)",
} as const;

export default function ResetPasswordPage() {
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access = params.get("access_token") || "";
    const refresh = params.get("refresh_token") || "";
    const errorDescription = params.get("error_description");

    if (errorDescription) {
      setMessage(decodeURIComponent(errorDescription));
    } else if (!access || !refresh) {
      setMessage("Palautuslinkki on virheellinen tai vanhentunut.");
    } else {
      setAccessToken(access);
      setRefreshToken(refresh);
      setReady(true);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmation) {
      setMessage("Uudet salasanat eivät täsmää.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/password/reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken, newPassword }),
      });
      const result = (await response.json()) as { message?: string };
      setMessage(result.message || "Salasanan palautus käsiteltiin.");
      if (response.ok) {
        setSuccess(true);
        window.history.replaceState({}, "", "/admin/reset-password");
      }
    } catch {
      setMessage("Salasanan palauttaminen epäonnistui.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "24px", background: "#f2f0ea", color: "#1a2320" }}>
      <section style={panelStyle}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: ".16em", fontWeight: 700 }}>JKP HALLINTA</p>
        <h1 style={{ margin: "14px 0 12px", fontSize: "clamp(30px, 5vw, 44px)", lineHeight: 1.05 }}>Aseta uusi salasana</h1>
        <p style={{ margin: "0 0 28px", lineHeight: 1.6 }}>
          Käytä vähintään 12 merkin salasanaa, jota ei käytetä muissa palveluissa.
        </p>

        {ready && !success ? (
          <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>
              Uusi salasana
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={12}
                required
                autoComplete="new-password"
                style={{ minHeight: 48, padding: "0 14px", border: "1px solid #aaa69d", font: "inherit" }}
              />
            </label>
            <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>
              Uusi salasana uudelleen
              <input
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                minLength={12}
                required
                autoComplete="new-password"
                style={{ minHeight: 48, padding: "0 14px", border: "1px solid #aaa69d", font: "inherit" }}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              style={{ minHeight: 50, border: 0, background: "#173d35", color: "white", padding: "0 18px", fontWeight: 700, cursor: "pointer" }}
            >
              {loading ? "Tallennetaan…" : "Vaihda salasana"}
            </button>
          </form>
        ) : null}

        {message ? <p role="status" style={{ marginTop: 20, padding: 14, background: success ? "#e8eee9" : "#f4e8e4", lineHeight: 1.5 }}>{message}</p> : null}
        <a href="/admin" style={{ display: "inline-block", marginTop: 24, color: "#173d35", fontWeight: 700 }}>
          {success ? "Siirry hallintaan →" : "← Takaisin kirjautumiseen"}
        </a>
      </section>
    </main>
  );
}
