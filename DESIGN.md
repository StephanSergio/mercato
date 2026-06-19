# Mercato — Design Brief

> Dit document beschrijft de Mercato-app en het huidige ontwerp. Het is bedoeld
> om aan een designer (of design-AI) te geven. Lever feedback/redesign terug in
> dezelfde structuur: **design tokens** (kleuren, typografie, spacing, radii,
> schaduwen) + **per-component specs** + **per-scherm layout**. Dan kan de
> ontwikkelaar het rechtstreeks omzetten naar CSS.

## 1. Wat is de app?

Een **gezamenlijke boodschappenlijst** voor één gezin (4 personen: Susanne,
Stephan, Miles, Julian). Iedereen gebruikt 'm op de eigen telefoon; wijzigingen
synchroniseren realtime. Geen login. Vier schermen via een bottom-navigatie:

1. **🛒 Winkellijst** — wat moet er gekocht worden, afvinken in de winkel.
2. **📋 Ingrediënten** — bladeren/zoeken, aantikken om aan de lijst toe te voegen.
3. **👨‍🍳 Recepten** — AI stelt een recept voor op basis van de lijst.
4. **⚙️ Beheer** — producten, aanbiedingen en categorieën beheren (CRUD).

**Gebruikscontext:** vooral mobiel, vaak staand in de supermarkt, soms met één
hand. Daarom: grote tikvlakken, rustig, snel scanbaar, weinig afleiding.

## 2. Gewenste sfeer

Werktitel: **"Warm Editorial Food"** — geïnspireerd op jamieoliver.com en
foodiesmagazine.nl. Minimalistisch maar warm; geen koude/technische
"Bootstrap"-look. Het mag aanvoelen als een mooi kookmagazine, niet als een
zakelijke webapp. Dit is de richting; de designer mag dit aanscherpen of een
alternatief voorstellen zolang het warm, rustig en mobiel-vriendelijk blijft.

## 3. Huidige design tokens

### Kleuren

| Token | Hex | Gebruik |
|---|---|---|
| `--color-cream` | `#FAF7F2` | Pagina-achtergrond |
| `--color-warm-white` | `#FFFFFF` | Kaarten, rijen |
| `--color-ink` | `#1C1C1A` | Primaire tekst |
| `--color-muted` | `#6B6560` | Subtekst, metadata |
| `--color-sage` | `#7A8C6E` | Accent groen: "staat op lijst", afgevinkt, tips |
| `--color-sage-soft` | `#EEF1EA` | Zachte groene vlakken/chips |
| `--color-terracotta` | `#C4622D` | Warm accent: CTA's, aanbiedingen, actieve tab |
| `--color-terracotta-dark` | `#A9521F` | Hover/donkere variant |
| `--color-sand` | `#E8E0D4` | Randen, dividers |
| `--color-highlight` | `#FFF3E0` | Zacht geel: aanbieding-highlight |
| `--color-danger` | `#B03A2E` | Verwijderen, verlopen aanbieding |
| Winkel AH | `#1F4BA3` | Blauwe winkel-badge |
| Winkel Lidl | `#0050AA` | Blauwe winkel-badge |
| Winkel Deka | `#D6203A` | Rode winkel-badge |

### Typografie

- **Display** (titels, categorie-koppen, recepttitel): `Playfair Display`,
  serif. Gewichten 500/600/700, soms italic.
- **Body** (lijsten, knoppen, labels): `Inter`, sans-serif. 400–700.
- Beide via Google Fonts. Body-inputs staan op `16px` om iOS-zoom te voorkomen.

### Vorm & ruimte

- Border-radius: **12px** op kaarten, **8px** op knoppen, **999px** (pill) op
  chips/badges.
- Schaduwen: **geen**, behalve subtiel op modals: `0 8px 32px rgba(0,0,0,0.08)`.
- Tikvlakken: minimaal **44px** hoog (supermarkt-gebruik).
- Max contentbreedte: **720px**, gecentreerd; daarbinnen mobile-first.
- Bottom-nav is fixed; content houdt onderaan ruimte vrij (nav + iOS safe-area).

## 4. Componenten (huidige staat)

- **App-header:** Playfair titel (~30px) + grijze subtitel + een "naam-pill"
  (sage, afgerond) met de huidige gebruiker (👤 Stephan). Klik = naam wijzigen.
- **Bottom-nav:** 4 items met emoji-icoon + label; actief item terracotta;
  badge met aantal open items op de winkellijst. Halftransparant met blur.
- **Categorie-kop:** emoji + naam (Playfair) + optioneel aantal rechts.
- **Ingrediënt-rij (Browser):** witte kaart, naam (bold) + eenheid +
  winkel-badges + evt. aanbiedings-badge; rechts een rond +/✓ indicator. Staat
  het al op de lijst → sage randje. Aanbieding → zacht gele achtergrond.
- **Check-rij (Winkellijst):** grote checkbox (28px, sage als afgevinkt),
  naam (doorgestreept + grijs als afgevinkt), "door <naam>", evt. badge, en een
  ×-knop om te verwijderen. Afgevinkte items zakken naar onderen.
- **Voortgangsbalk:** "5 van 12 items gedaan" + sage balk.
- **Aanbiedings-badge:** kleine terracotta pill met 🏷️ + tekst (bijv.
  "AH · 2 voor €5"); verlopen = uitgetint (zand/grijs) met ⏳.
- **Winkel-badges:** kleine gekleurde tekst-labels (AH/Lidl/Deka).
- **Knoppen:** primair (terracotta), sage, ghost (wit + zandrand), klein,
  block. Pill-toggle voor filters ("Alleen aanbiedingen").
- **Formulieren (Beheer):** velden op crème achtergrond met zandrand; toggle-
  switch (sage als aan); checkbox-chips voor winkels; tabbladen (Ingrediënten /
  Aanbiedingen / Categorieën).
- **Recept-kaart:** grote Playfair titel, cursieve omschrijving, pills voor
  porties/prep/kooktijd, ingrediëntenlijst met bullets, genummerde stappen
  (terracotta cijfer-rondjes), tip-box in sage met linkerrand.
- **Naam-modal:** centrale modal met preset-namen als chips + vrij tekstveld.

## 5. Schermen (layout)

1. **Winkellijst:** header → voortgangsbalk → per categorie (vaste volgorde) een
   kop + check-rijen → onderaan "Aangevinkte items verwijderen". Lege staat:
   vriendelijke melding met 🛒.
2. **Ingrediënten:** header → toolbar (zoekveld + aanbiedingsfilter) → per
   categorie kop + ingrediënt-rijen. Aantikken voegt toe/verwijdert.
3. **Recepten:** korte intro → kaartje met "wat staat er op je lijst" (chips) →
   knop "Stel een recept voor" → recept-kaart → knoppen "Nieuw recept" +
   "Ontbrekende ingrediënten toevoegen".
4. **Beheer:** evt. seed-melding → tabbladen → lijst van items met edit/delete,
   inline formulieren, en categorie-herordening (↑/↓).

## 6. Technische randvoorwaarden (voor de designer)

- Implementatie is **React + handgeschreven CSS** (geen UI-library, geen
  Tailwind). Lever dus tokens + componentbeschrijvingen, geen kant-en-klare
  framework-componenten.
- **Mobile-first**, moet werken op iOS Safari en Android Chrome (let op
  safe-area onderaan en `16px` inputs tegen zoom).
- **Toegankelijkheid:** voldoende contrast, 44px tikvlakken, focus-states,
  respecteer `prefers-reduced-motion`.
- Iconen zijn nu **emoji** (geen icon-library). Mag blijven of vervangen worden
  door een lichte set — geef dat dan expliciet aan.
- Animaties subtiel houden (lijst draait in de supermarkt op mindere telefoons).

## 7. Wat ik graag terugkrijg

Lever het redesign terug als:

1. **Tokens** — definitieve kleuren (hex), typografie (fonts + groottes/gewichten
   per rol), spacing-schaal, radii, schaduwen.
2. **Per component** — korte spec: maten, kleuren, states (default / hover /
   actief / disabled / afgevinkt / aanbieding / verlopen).
3. **Per scherm** — een mockup of duidelijke layoutbeschrijving.
4. Markeer wat **vast** is en wat **vrij** te interpreteren is.

Met dat formaat kan de ontwikkelaar het direct vertalen naar
`src/styles/globals.css` (tokens) en `src/styles/components.css` (componenten).
