"use client";

import { FormEvent, useState } from "react";

const panelStyle = {
  width: "min(100% - 32px, 520px)",
  margin: "8vh auto",
  padding: "40px",
  border: "1px solid #d7d2c8",
  background: "#fff",
  boxShadow: "0 22px 60px rgba(26, 35, 32, 0.10)",
} as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("jari.koskela@jkpgroup.fi");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string };
      setMessage(result.message || "Palautuspyyntö käsiteltiin.");
    } catch {
      setMessage("Palautuspyynnön lähettäminen epäonnistui.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "24px", background: "#f2f0ea", color: "#1a2320" }}>
      <section style={panelStyle}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: ".16em", fontWeight: 700 }}>JKP HALLINTA</p>
        <h1 style={{ margin: "14px 0 12px", fontSize: "clamp(30px, 5vw, 44px)", lineHeight: 1.05 }}>Palauta salasana</h1>
        <p style={{ margin: "0 0 28px", lineHeight: 1.6 }}>
          Saat sähköpostiin kertakäyttöisen palautuslinkin. Linkki avaa suojatun salasanan vaihtosivun.
        </p>
        <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 7, fontWeight: 700 }}>
            Sähköposti
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              style={{ minHeight: 48, padding: "0 14px", border: "1px solid #aaa69d", font: "inherit" }}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            style={{ minHeight: 50, border: 0, background: "#173d35", color: "white", padding: "0 18px", fontWeight: 700, cursor: "pointer" }}
          >
            {loading ? "Lähetetään…" : "Lähetä palautuslinkki"}
          </button>
        </form>
        {message ? <p role="status" style={{ marginTop: 20, padding: 14, background: "#e8eee9", lineHeight: 1.5 }}>{message}</p> : null}
        <a href="/admin" style={{ display: "inline-block", marginTop: 24, color: "#173d35", fontWeight: 700 }}>← Takaisin kirjautumiseen</a>
      </section>
    </main>
  );
}
