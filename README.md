# JKP Group Website

JKP Group Oy:n verkkosivusto. Sovellus yhdistää talotekniikan asiantuntijapalvelut, vuokrakohteet, referenssit ja kolme yhteydenottopolkua.

## Nykyinen tuotantotila

Sivusto toimii oletuksena ilman Supabasea:

```text
DATA_BACKEND=static
```

- Tekstit ovat versionhallittuna tiedostossa `content/defaults.ts`.
- Vuokrakohteiden väliaikainen lista on tiedostossa `lib/rentals.ts`.
- Referenssien väliaikainen lista on tiedostossa `lib/references.ts`.
- Vain asiakkaan vahvistamia tietoja lisätään julkisiksi.
- `/admin` ei tallenna muutoksia static-tilassa.

Supabase-koodi ja migraatio säilyvät valmiina myöhempää käyttöönottoa varten.

## Teknologia

- Next.js App Router
- TypeScript
- React
- GitHub: sisältö ja versionhallinta nykyisessä static-tilassa
- Resend: valinnainen automaattinen lomakeilmoitus
- Supabase: valinnainen myöhempi sisältö-, media- ja lomaketallennus
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

Static-tilan vähimmäisasetus:

```text
NEXT_PUBLIC_SITE_URL
DATA_BACKEND=static
CONTACT_TO_EMAIL
```

Automaattinen lomakelähetys:

```text
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
```

Ilman Resend-avainta lomake avaa käyttäjän sähköpostiohjelmaan valmiiksi täytetyn viestin. Viestiä ei tällöin tallenneta palvelimelle.

Myöhempi Supabase-tila:

```text
DATA_BACKEND=supabase
ADMIN_PASSWORD
SESSION_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
```

`SUPABASE_SERVICE_ROLE_KEY` kuuluu vain palvelinympäristöön. Älä lisää oikeita avaimia GitHubiin.

## Supabase myöhemmin

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

Vaihda tämän jälkeen Vercelissä:

```text
DATA_BACKEND=supabase
```

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

Julkisilla lomakkeilla ei kerätä henkilötunnusta, pankkitietoja tai luottotietoasiakirjoja.

## Julkaisu

1. Varmista onnistunut `npm run build` Vercelin lokista.
2. Testaa julkiset sivut ja lomakkeiden sähköpostifallback.
3. Lisää Resend-ympäristömuuttujat, kun automaattinen toimitus halutaan käyttöön.
4. Kytke `jkpgroup.fi` vasta asiakkaan hyväksynnän jälkeen.
5. Ota Supabase myöhemmin käyttöön vaihtamalla `DATA_BACKEND=supabase` ja lisäämällä sen avaimet.
