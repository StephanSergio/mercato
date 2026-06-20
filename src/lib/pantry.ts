// ============================================================
// Voorraadkast: verpakkingsgroottes per ingrediënt + samenvoegen.
// ------------------------------------------------------------
// Hiermee rekenen we uit hoeveel je écht moet kópen. Twee gerechten met
// elk 500 ml melk = 1000 ml; een pak melk is 1000 ml → 1 pak (niet 2).
// ============================================================

import type {
  ConsolidatedItem,
  DishIngredient,
  IngredientUnit,
} from '../types'

interface PantryItem {
  pack: number // verpakkingsgrootte in `unit`
  unit: IngredientUnit
  category: string // categorie voor groepering op de winkellijst
}

// Bekende producten met hun verpakkingsgrootte. Namen in kleine letters.
// Onbekende ingrediënten vallen terug op een verstandige standaard (zie onder).
export const PANTRY: Record<string, PantryItem> = {
  // Zuivel & eieren
  melk: { pack: 1000, unit: 'ml', category: 'Zuivel' },
  room: { pack: 250, unit: 'ml', category: 'Zuivel' },
  'kookroom': { pack: 250, unit: 'ml', category: 'Zuivel' },
  yoghurt: { pack: 500, unit: 'ml', category: 'Zuivel' },
  'griekse yoghurt': { pack: 500, unit: 'ml', category: 'Zuivel' },
  boter: { pack: 250, unit: 'g', category: 'Zuivel' },
  'geraspte kaas': { pack: 200, unit: 'g', category: 'Zuivel' },
  kaas: { pack: 200, unit: 'g', category: 'Zuivel' },
  parmezaan: { pack: 100, unit: 'g', category: 'Zuivel' },
  feta: { pack: 200, unit: 'g', category: 'Zuivel' },
  geitenkaas: { pack: 150, unit: 'g', category: 'Zuivel' },
  'zure room': { pack: 125, unit: 'ml', category: 'Zuivel' },
  eieren: { pack: 6, unit: 'stuks', category: 'Zuivel' },

  // Vlees & vis
  gehakt: { pack: 500, unit: 'g', category: 'Vlees' },
  kipfilet: { pack: 500, unit: 'g', category: 'Vlees' },
  'kip': { pack: 500, unit: 'g', category: 'Vlees' },
  rundvlees: { pack: 500, unit: 'g', category: 'Vlees' },
  rookworst: { pack: 1, unit: 'stuks', category: 'Vlees' },
  zalmfilet: { pack: 250, unit: 'g', category: 'Vis' },
  garnalen: { pack: 200, unit: 'g', category: 'Vis' },

  // Groente & fruit
  ui: { pack: 1, unit: 'stuks', category: 'Groente' },
  knoflook: { pack: 1, unit: 'stuks', category: 'Groente' },
  paprika: { pack: 1, unit: 'stuks', category: 'Groente' },
  tomaat: { pack: 1, unit: 'stuks', category: 'Groente' },
  komkommer: { pack: 1, unit: 'stuks', category: 'Groente' },
  avocado: { pack: 1, unit: 'stuks', category: 'Groente' },
  citroen: { pack: 1, unit: 'stuks', category: 'Groente' },
  spinazie: { pack: 300, unit: 'g', category: 'Groente' },
  boerenkool: { pack: 500, unit: 'g', category: 'Groente' },
  champignons: { pack: 250, unit: 'g', category: 'Groente' },
  'zoete aardappel': { pack: 1, unit: 'stuks', category: 'Groente' },
  aardappel: { pack: 1000, unit: 'g', category: 'Groente' },
  wortel: { pack: 1, unit: 'stuks', category: 'Groente' },
  mais: { pack: 150, unit: 'g', category: 'Groente' },
  sla: { pack: 1, unit: 'stuks', category: 'Groente' },

  // Voorraad & droog
  spaghetti: { pack: 500, unit: 'g', category: 'Voorraad' },
  pasta: { pack: 500, unit: 'g', category: 'Voorraad' },
  rijst: { pack: 1000, unit: 'g', category: 'Voorraad' },
  bloem: { pack: 1000, unit: 'g', category: 'Voorraad' },
  'rode linzen': { pack: 500, unit: 'g', category: 'Voorraad' },
  kikkererwten: { pack: 400, unit: 'g', category: 'Voorraad' },
  'bruine bonen': { pack: 400, unit: 'g', category: 'Voorraad' },
  tomatenblik: { pack: 400, unit: 'g', category: 'Voorraad' },
  kokosmelk: { pack: 400, unit: 'ml', category: 'Voorraad' },
  tortilla: { pack: 8, unit: 'stuks', category: 'Voorraad' },
  'wraps': { pack: 6, unit: 'stuks', category: 'Voorraad' },
  flatbread: { pack: 4, unit: 'stuks', category: 'Voorraad' },
  bladerdeeg: { pack: 6, unit: 'stuks', category: 'Voorraad' },
  hamburgerbroodjes: { pack: 4, unit: 'stuks', category: 'Voorraad' },
  hummus: { pack: 200, unit: 'g', category: 'Voorraad' },
  tofu: { pack: 350, unit: 'g', category: 'Voorraad' },
  olijven: { pack: 150, unit: 'g', category: 'Voorraad' },
  noedels: { pack: 250, unit: 'g', category: 'Voorraad' },
  gyoza: { pack: 20, unit: 'stuks', category: 'Diepvries' },

  // Sauzen & smaakmakers
  ketjap: { pack: 250, unit: 'ml', category: 'Sauzen' },
  sojasaus: { pack: 250, unit: 'ml', category: 'Sauzen' },
  currypasta: { pack: 100, unit: 'g', category: 'Sauzen' },
  bouillonblokje: { pack: 6, unit: 'stuks', category: 'Sauzen' },
}

// Eenheden die we kunnen optellen tot verpakkingen. `el/tl/snuf` niet.
const COUNTABLE: IngredientUnit[] = ['ml', 'g', 'stuks']

function norm(name: string): string {
  return name.toLowerCase().trim()
}

// Mooie weergave van een hoeveelheid (1000 ml → "1 l", 1500 g → "1,5 kg").
function formatQty(qty: number, unit: IngredientUnit): string {
  if (unit === 'ml' && qty >= 1000)
    return `${(qty / 1000).toLocaleString('nl-NL')} l`
  if (unit === 'g' && qty >= 1000)
    return `${(qty / 1000).toLocaleString('nl-NL')} kg`
  return `${qty} ${unit}`
}

// Voegt ingrediënten van één of meer gerechten samen en rekent het aantal
// te kopen verpakkingen uit op basis van de verpakkingsgrootte.
export function consolidate(ingredients: DishIngredient[]): ConsolidatedItem[] {
  // 1) Optellen per (genormaliseerde) naam.
  const sums = new Map<
    string,
    { name: string; qty: number; unit: IngredientUnit }
  >()
  for (const ing of ingredients) {
    const key = norm(ing.name)
    const cur = sums.get(key)
    if (cur && cur.unit === ing.unit) {
      cur.qty += ing.qty
    } else if (!cur) {
      sums.set(key, { name: ing.name, qty: ing.qty, unit: ing.unit })
    } else {
      // Verschillende eenheid voor dezelfde naam: tel apart onder een sub-key.
      sums.set(`${key}|${ing.unit}`, {
        name: ing.name,
        qty: ing.qty,
        unit: ing.unit,
      })
    }
  }

  // 2) Verpakkingen uitrekenen.
  const out: ConsolidatedItem[] = []
  for (const { name, qty, unit } of sums.values()) {
    const p = PANTRY[norm(name)]
    let packages: number
    if (p && p.unit === unit && COUNTABLE.includes(unit)) {
      packages = Math.max(1, Math.ceil(qty / p.pack))
    } else if (unit === 'stuks') {
      packages = Math.max(1, Math.ceil(qty / (p?.pack ?? 1)))
    } else {
      // el/tl/snuf of onbekende combinatie: gewoon 1 verpakking.
      packages = 1
    }
    out.push({
      name,
      category: p?.category ?? 'Overig',
      unit,
      totalQty: qty,
      packages,
      note: `${formatQty(qty, unit)} nodig`,
    })
  }

  // 3) Sorteer op categorie, dan naam — leest prettig op de lijst.
  return out.sort(
    (a, b) =>
      a.category.localeCompare(b.category, 'nl') ||
      a.name.localeCompare(b.name, 'nl')
  )
}
