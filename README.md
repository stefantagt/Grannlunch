# Grannlunch

En enkel sida för nästa gemensamma promenad och lunch i Björkhaga.

Utan Supabase-nycklar visas en exempel-lunch, och anmälan sparas bara tills sidan laddas om. Med nycklar läses lunchen från databasen och anmälan sparas.

## Kör lokalt

```bash
npm install
npm run dev
```

Öppna adressen som Vite skriver ut, oftast http://localhost:5173.

## Supabase

1. Skapa ett gratis projekt på [supabase.com](https://supabase.com).
2. Öppna SQL Editor och kör hela [supabase/schema.sql](supabase/schema.sql).
3. Kopiera `.env.example` till `.env.local`.
4. Fyll i `VITE_SUPABASE_URL` och `VITE_SUPABASE_ANON_KEY` från Project Settings, API.

Använd bara anon-nyckeln. Lägg aldrig en service role-nyckel i frontend eller i git.

Lunch, tid, restaurang och pris ändras i tabellen `lunches`. Sidan visar den närmaste raden som har status `published`.

## Bygg

```bash
npm run build
npm run preview
```

## Publicera med GitHub Pages

Repot behöver ligga på GitHub. Workflow-filen `.github/workflows/pages.yml` bygger och publicerar sidan när du pushar till `main`.

1. Under Settings, Pages: välj GitHub Actions som källa.
2. Lägg `VITE_SUPABASE_URL` och `VITE_SUPABASE_ANON_KEY` som Actions secrets. Samma värden som i `.env.local`.
3. Innan du har en egen domän: lägg en Actions variable `VITE_BASE_PATH` med värdet `/Grannlunch/` om repot heter så. Sidan hamnar då på `https://användarnamn.github.io/Grannlunch/`.
4. Med egen domän: ta bort den variabeln, eller sätt den till `/`.

Anon-nyckeln hamnar i det publika bygget. Det är väntat. Den får bara läsa publicerade luncher och antal anmälningar, och skapa en anmälan eller en prenumeration. Den kan inte läsa andras namn eller e-post.

## Egen domän via one.com

Köp bara domänen. Webbhotell behövs inte.

När GitHub Pages är igång:

1. I repot, Settings, Pages: skriv in domänen.
2. Hos one.com, peka DNS dit GitHub visar. Ofta fyra A-poster mot GitHubs adresser, och för `www` en CNAME till `användarnamn.github.io`.
3. Vänta tills https är klart. Då är `VITE_BASE_PATH` bara `/`.

## Bilder

Sidan använder förminskade kopior i `public/bjorkhaga/web`, och klippet `public/bjorkhaga/IMG_1780.MP4`. Kamerans original-JPEG ligger lokalt i `original/bjorkhaga` och publiceras inte. Kör om förminskningen efter nya bilder:

```bash
node scripts/compress-photos.mjs
```
