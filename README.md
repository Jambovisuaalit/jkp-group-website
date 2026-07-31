# JKP Group Website

JKP Group Oy:n tuotantoverkkosivusto. Sovellus yhdistää talotekniikan asiantuntijapalvelut, vuokrakohteet, referenssit, lomakkeet ja suojatun sisällönhallinnan.

## Teknologia

- Next.js App Router
- TypeScript
- React
- Supabase: sisältö, vuokrakohteet, referenssit, lomaketallennus ja media
- Resend: lomakeilmoitukset
- Vercel: preview- ja tuotantojulkaisu

## Paikallinen käynnistys

```bash
npm install
cp .env.example .env.local
npm run dev
```

Avaa `http://localhost:3000`.

## Tuotantobuild

```bash
npm run build
npm start
```

## Ympäristömuuttujat

```text
NEXT_PUBLIC_SITE_URL
ADMIN_PASSWORD
SESSION_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
```

`SUPABASE_SERVICE_ROLE_KEY` kuuluu vain palvelinympäristöön. Älä lisää oikeita avaimia GitHubiin.

## Supabase

Suorita migraatio:

```text
supabase/migrations/202607310001_jkp_primary_backend.sql
```

Migraatio luo:

- `jkp_site_content`
- `jkp_rental_properties`
- `jkp_references`
- `jkp_form_submissions`
- `jkp-media` Storage-bucketin
- RLS-suojaukset

## Reitit

- `/`
- `/talotekniikka`
- `/vuokraus`
- `/vuokraus/[slug]`
- `/referenssit`
- `/admin`

## Vuokrakohteiden näkyvyys

- Loma-asunnot ja kiinteistöt näkyvät julkaistuina jatkuvasti.
- Liike- ja toimitilat näkyvät vain vapaina.
- Vuokra-asunnot näkyvät vain vapaina.

## Lomakkeet

- yleinen yhteydenotto
- B2B-toimitilojen tarjouspyyntö
- asuntovuokrauksen hakemus

Lomakkeet tallennetaan Supabaseen ennen mahdollista Resend-ilmoitusta. Julkisilla lomakkeilla ei kerätä henkilötunnusta, pankkitietoja tai luottotietoasiakirjoja.

## Julkaisu

1. Kytke tämä repository omaan Vercel-projektiin.
2. Lisää ympäristömuuttujat Preview- ja Production-ympäristöihin.
3. Varmista onnistunut `npm run build` Vercelin lokista.
4. Testaa admin, media-upload ja lomakkeet.
5. Kytke `jkpgroup.fi` vasta asiakkaan hyväksynnän jälkeen.
