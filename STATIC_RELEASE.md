# JKP Group — static release 31.7.2026

## Päätös

Supabase ohitetaan väliaikaisesti. GitHubin `main` säilyttää Supabase-valmiin arkkitehtuurin ja migraation, mutta oletuskäyttötila on:

```text
DATA_BACKEND=static
```

## Vercel-preview

- Project: `jkp-group-website`
- Project ID: `prj_BMDbytbezvqUW4YA0lA9CY4tg7rx`
- Deployment ID: `dpl_Ga6qaEhB6VGEXNh69irJo8DAwoeb`
- Preview URL: `https://jkp-group-website-d89sbw5me-info-32533854s-projects.vercel.app`
- Status: `READY`
- Robots: `noindex, nofollow`

## Static-tilassa toimivat

- etusivu
- talotekniikan palvelusivu
- vuokraussivu
- B2B-toimitilalomake
- asuntovuokrauksen hakemus
- referenssisivu
- yleinen yhteydenottolomake
- sitemap ja robots
- responsiivinen käyttöliittymä
- tietoturvaheaderit

## Lomakkeiden toimitus

1. Jos `RESEND_API_KEY` ja `CONTACT_FROM_EMAIL` on asetettu, viesti toimitetaan automaattisesti Resendillä.
2. Ilman Resendiä lomake avaa käyttäjän sähköpostiohjelmaan valmiiksi täytetyn viestin osoitteeseen `jari.koskela@jkpgroup.fi`.
3. Static-tilassa lomaketietoja ei tallenneta palvelimelle.

## Sisältöjen hallinta

- Tekstit: `content/defaults.ts`
- Vuokrakohteet: `lib/rentals.ts`
- Referenssit: `lib/references.ts`
- `/admin` ei tallenna muutoksia static-tilassa.

## Supabasen myöhempi käyttöönotto

1. Luo oma JKP Supabase -projekti.
2. Suorita `supabase/migrations/202607310001_jkp_primary_backend.sql`.
3. Lisää Verceliin Supabase-avaimet.
4. Aseta `DATA_BACKEND=supabase`.
5. Testaa admin, media-upload, kohteet, referenssit ja lomaketallennus.
