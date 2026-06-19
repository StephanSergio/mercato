# 🛒 Mercato

Een warme, gezamenlijke boodschappenlijst-app voor het gezin. Realtime sync via
Firebase, met ingrediëntenbeheer, aanbiedingen en receptideeën (Claude).
Gebouwd met React + Vite, gehost op GitHub Pages.

> Stijl: **"Warm Editorial Food"** — Playfair Display + Inter, crème
> achtergrond, terracotta & sage accenten. Mobile-first, grote tikvlakken voor
> gebruik in de supermarkt.

## Schermen

- **🛒 Winkellijst** — items per categorie, grote vinkjes, voortgangsteller,
  realtime sync (iemand vinkt af → jij ziet het direct), "aangevinkte items
  verwijderen".
- **📋 Ingrediënten** — bladeren per categorie, zoeken, aanbiedingsfilter; tik
  een item aan om het toe te voegen aan / te verwijderen van de lijst.
- **👨‍🍳 Recepten** — Claude stelt één recept voor op basis van je lijst, en kan
  ontbrekende ingrediënten toevoegen.
- **⚙️ Beheer** — volledig CRUD voor ingrediënten, aanbiedingen en categorieën,
  plus een knop om de database te vullen met startdata.

---

## 1. Lokaal draaien

```bash
npm install
cp .env.example .env.local   # vul daarna je eigen waarden in
npm run dev
```

### Firebase-config invullen

1. Maak een Firebase-project op <https://console.firebase.google.com>.
2. **Firestore Database** aanmaken (productie- of testmodus — zie regels hieronder).
3. **Project settings → General → Your apps → Web app** → kopieer de SDK-config.
4. Plak de waarden in `.env.local`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Firestore-regels

De app gebruikt **geen login** (bewuste keuze — het gezin deelt de lijst
direct). Zet de regels uit `firestore.rules` in je project (Firestore →
Rules → plakken → Publish). Die staan lezen/schrijven open op de drie
collecties en blokkeren de rest.

> Wil je het strakker? Voeg Firebase **Anonymous Auth** toe en pas de regels aan
> naar `allow read, write: if request.auth != null;`.

### Database vullen

Start de app, ga naar **Beheer** en klik op **🌱 Database vullen**. Dat schrijft
11 categorieën en ~45 ingrediënten (incl. enkele aanbiedingen). De knop doet
niets als er al data is.

---

## 2. Recepten (Claude API)

Het receptenscherm roept de **Anthropic Claude API** (`claude-sonnet-4-6`) aan.
Er zijn twee manieren; kies er één.

### Optie A — Firebase Function proxy (aanbevolen, sleutel blijft geheim)

GitHub Pages heeft geen backend, dus we gebruiken een kleine Firebase Cloud
Function (`functions/index.js`) als proxy. De browser stuurt alleen de
ingrediënten; de functie voegt de Anthropic-sleutel toe. De sleutel staat als
**Firebase secret** en komt nooit in de browser.

> Vereist het **Blaze (pay-as-you-go)** plan — functions draaien niet op het
> gratis Spark-plan. Voor een gezins-app blijf je vrijwel zeker binnen de
> gratis tier.

```bash
npm install -g firebase-tools         # eenmalig
firebase login
firebase use --add                    # kies je Firebase-project

cd functions && npm install && cd ..

# Anthropic-sleutel als secret opslaan (wordt NIET in code/bundle opgenomen):
firebase functions:secrets:set ANTHROPIC_API_KEY

firebase deploy --only functions
```

Na de deploy print de CLI de functie-URL, bijv.
`https://us-central1-<project-id>.cloudfunctions.net/recipe`. Zet die in
`.env.local` (en als GitHub Actions secret):

```
VITE_RECIPE_PROXY_URL=https://us-central1-<project-id>.cloudfunctions.net/recipe
```

Pas in `functions/index.js` de lijst `ALLOWED_ORIGINS` aan naar jouw
domein(en) als die afwijkt.

### Optie B — directe browser-aanroep (simpel)

Zet alleen `VITE_ANTHROPIC_API_KEY`. De app roept Anthropic dan rechtstreeks
vanuit de browser aan.

> ⚠️ De sleutel is dan **zichtbaar in de browser-bundle** voor elke bezoeker.
> Gebruik alleen een sleutel met strakke uitgavenlimieten. Prima voor een privé
> gezins-app; niet voor een publieke site.

Laat **beide** leeg om de receptenfunctie uit te zetten — de rest van de app
blijft gewoon werken. Staat `VITE_RECIPE_PROXY_URL` gezet, dan wordt de directe
sleutel genegeerd.

---

## 3. Deployen naar GitHub Pages

Er is een GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Push de repo naar `https://github.com/StephanSergio/mercato`.
2. **Settings → Secrets and variables → Actions** → voeg dezelfde variabelen toe
   als in `.env.local` (`VITE_FIREBASE_*` en `VITE_ANTHROPIC_API_KEY`).
3. **Settings → Pages → Source: GitHub Actions**.
4. Push naar `main` → de site verschijnt op
   **<https://stephansergio.github.io/mercato/>**.

> De `base` in `vite.config.js` staat op `/mercato/` — dat moet overeenkomen met
> de repo-naam. Heet de repo anders, pas dit aan.

---

## Projectstructuur

```
src/
  App.jsx                  routing (state) + shell
  firebase.js              Firebase config + exports
  components/
    BottomNav.jsx          navigatiebalk onderaan
    ShoppingList.jsx        winkellijst (realtime)
    IngredientBrowser.jsx   ingrediënten bladeren
    AdminPanel.jsx          CRUD: ingrediënten / aanbiedingen / categorieën
    RecipeGenerator.jsx     Claude-recept
    NameModal.jsx           "wie ben jij?"
    ui/                     SaleBadge, CategoryHeader, IngredientRow,
                            RecipeCard, StoreBadges
  hooks/
    useShoppingList.js  useIngredients.js  useCategories.js  useUserName.js
  lib/
    recipe.js            Claude API-aanroep
    seed.js              startdata + vul-functie
    dates.js             aanbiedings-datumhelpers
  styles/
    globals.css          tokens + reset
    components.css        componentstijlen
firestore.rules          Firestore beveiligingsregels
```

## Scripts

| Commando          | Doel                       |
| ----------------- | -------------------------- |
| `npm run dev`     | dev-server (HMR)           |
| `npm run build`   | productie-build naar `dist/` |
| `npm run preview` | build lokaal bekijken      |
| `npm run lint`    | ESLint                     |
