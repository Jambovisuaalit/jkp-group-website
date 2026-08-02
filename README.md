# JKP Group Website

JKP Group Oy:n verkkosivusto. Sovellus yhdistää talotekniikan asiantuntijapalvelut, vuokrakohteet, referenssit ja kolme yhteydenottopolkua.

## Nykyinen tuotantotila

Backend-tila valitaan aina eksplisiittisesti. Turvallinen paikallinen ja CI-oletus on:

```text
DATA_BACKEND=static
```

- Tekstit ovat versionhallittuna tiedostossa `content/defaults.ts`.
- Vuokrakohteiden väliaikainen lista on tiedostossa `lib/rentals.ts`.
- Referenssien väliaikainen lista on tiedostossa `lib/references.ts`.
- Vain asiakkaan vahvistamia tietoja lisätään julkisiksi.
- `/admin` ja kaikki CMS:n kirjoitus- ja upload-reitit on estetty static-tilassa.

Supabase-koodi ja migraatio säilyvät valmiina myöhempää käyttöönottoa varten.

## Teknologia

- Next.js App Router
- TypeScript
- React
- GitHub: sisältö ja versionhallinta nykyisessä static-tilassa
- Resend: valinnainen automaattinen lomakeilmoitus
- Supabase: valinnainen myöhempi sisältö-, media- ja lomaketallennus
- Vercel: preview- ja tuotantojulkaisu

## Runtime ja paikallinen käynnistys

Käytä Node.js 22.x:ää (`.nvmrc`).

```bash
nvm use
npm ci
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

Supabase CMS -tila:

```text
DATA_BACKEND=supabase
SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
SUPABASE_STORAGE_BUCKET
```

`SUPABASE_SECRET_KEY` (tai legacy-yhteensopiva `SUPABASE_SERVICE_ROLE_KEY`) kuuluu vain palvelinympäristöön. Älä lisää oikeita avaimia GitHubiin. Sovellus ei käytä kovakoodattua Supabase-projektia tai avainta: `supabase`-tila toimii vain, kun URL, publishable-avain ja palvelinavain on määritetty.

Hallinta käyttää Supabase Authia. Onnistunut kirjautuminen luo HTTP-only-, Secure- ja SameSite=Strict-istuntoevästeet, ja käyttöoikeus tarkistetaan aktiivisesta `jkp_admin_users`-rivistä. Pääkäyttäjä provisionoidaan luovutuksessa komennolla `npm run bootstrap:admin`; salasanaa ei tallenneta lähdekoodiin.

## Supabase-migraatiot

Suorita migraatiot aikajärjestyksessä Supabase CLI:llä tai hallitulla deploymentilla:

```text
supabase/migrations/202607310001_jkp_primary_backend.sql
supabase/migrations/202608010001_jkp_admin_cms.sql
supabase/migrations/202608010002_jkp_private_media.sql
supabase/migrations/202608010003_restrict_rls_auto_enable.sql
supabase/migrations/202608010004_generic_admin_identity.sql
supabase/migrations/202608011210_qa_admin_authenticated_rls.sql
```

Migraatioketju luo ja suojaa:

- `jkp_site_content`
- `jkp_rental_properties`
- `jkp_references`
- `jkp_form_submissions`
- yksityisen `jkp-media` Storage-bucketin
- Supabase Authiin sidotun `jkp_admin_users`-käyttöoikeuden
- RLS-suojaukset aktiiviselle ylläpitäjälle

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
5. Ota CMS käyttöön vasta kaikkien migraatioiden jälkeen vaihtamalla `DATA_BACKEND=supabase` ja lisäämällä projektikohtaiset avaimet.

## Release-portti

```bash
npm ci
npm run check
npm audit --omit=dev
```

`npm run check` ajaa järjestyksessä ESLintin, TypeScriptin ja production buildin. CI käyttää Node 22.x:ää, versionhallittua `package-lock.json`-tiedostoa ja `npm ci`:tä.
