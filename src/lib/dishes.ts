// ============================================================
// Gerecht-suggesties voor het Match-scherm ("Tinder voor eten").
// ------------------------------------------------------------
// Werkt out-of-the-box met een vaste deck van gerechten. Als er een
// Anthropic-sleutel of proxy is ingesteld, kan de kok een verse deck
// voorstellen via `generateDishIdeas()` (zelfde proxy als recepten).
// ============================================================

import type { DishIdea, DishIngredient } from '../types'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const PROXY_URL = import.meta.env.VITE_RECIPE_PROXY_URL
const MODEL = 'claude-sonnet-4-6'

// AI-suggesties zijn optioneel; de vaste deck werkt altijd.
export const isDishAiEnabled = Boolean(PROXY_URL || API_KEY)

// Maakt een stabiele slug van een titel, zodat stemmen van verschillende
// mensen op hetzelfde gerecht aan elkaar gekoppeld worden.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accenten weg
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Vaste deck: vertrouwde gezinsgerechten. Volgorde wordt per sessie
// gehusseld zodat het "swipen" elke keer fris voelt.
const STATIC_DECK: Omit<DishIdea, 'id'>[] = [
  { emoji: '🍝', title: 'Spaghetti Bolognese', description: 'Romige tomatensaus met gehakt, lang gestoofd.',
    ingredients: [ { name: 'gehakt', qty: 300, unit: 'g' }, { name: 'spaghetti', qty: 250, unit: 'g' }, { name: 'tomatenblik', qty: 400, unit: 'g' }, { name: 'ui', qty: 1, unit: 'stuks' }, { name: 'knoflook', qty: 1, unit: 'stuks' } ] },
  { emoji: '🌮', title: 'Taco-avond', description: 'Zelf opbouwen met gekruid vlees, mais en avocado.',
    ingredients: [ { name: 'gehakt', qty: 300, unit: 'g' }, { name: 'tortilla', qty: 6, unit: 'stuks' }, { name: 'mais', qty: 150, unit: 'g' }, { name: 'avocado', qty: 1, unit: 'stuks' }, { name: 'geraspte kaas', qty: 100, unit: 'g' } ] },
  { emoji: '🍛', title: 'Indiase curry', description: 'Milde kerrie met kikkererwten en kokosmelk.',
    ingredients: [ { name: 'kikkererwten', qty: 400, unit: 'g' }, { name: 'kokosmelk', qty: 400, unit: 'ml' }, { name: 'ui', qty: 1, unit: 'stuks' }, { name: 'currypasta', qty: 50, unit: 'g' }, { name: 'rijst', qty: 250, unit: 'g' } ] },
  { emoji: '🍕', title: 'Zelfgemaakte pizza', description: 'Knapperige bodem, ieder zijn eigen beleg.',
    ingredients: [ { name: 'bloem', qty: 300, unit: 'g' }, { name: 'tomatenblik', qty: 200, unit: 'g' }, { name: 'geraspte kaas', qty: 150, unit: 'g' }, { name: 'paprika', qty: 1, unit: 'stuks' } ] },
  { emoji: '🥘', title: 'Risotto met paddenstoelen', description: 'Romig, met Parmezaan en verse tijm.',
    ingredients: [ { name: 'rijst', qty: 300, unit: 'g' }, { name: 'champignons', qty: 250, unit: 'g' }, { name: 'parmezaan', qty: 50, unit: 'g' }, { name: 'ui', qty: 1, unit: 'stuks' } ] },
  { emoji: '🍜', title: 'Noedelsoep', description: 'Pittige bouillon met groenten en ei.',
    ingredients: [ { name: 'noedels', qty: 250, unit: 'g' }, { name: 'bouillonblokje', qty: 1, unit: 'stuks' }, { name: 'eieren', qty: 2, unit: 'stuks' }, { name: 'wortel', qty: 1, unit: 'stuks' }, { name: 'sojasaus', qty: 30, unit: 'ml' } ] },
  { emoji: '🥗', title: 'Griekse salade-bowl', description: 'Feta, olijven, komkommer en een frisse dressing.',
    ingredients: [ { name: 'feta', qty: 200, unit: 'g' }, { name: 'olijven', qty: 100, unit: 'g' }, { name: 'komkommer', qty: 1, unit: 'stuks' }, { name: 'tomaat', qty: 2, unit: 'stuks' }, { name: 'sla', qty: 1, unit: 'stuks' } ] },
  { emoji: '🐟', title: 'Zalm uit de oven', description: 'Met citroen, dille en geroosterde groenten.',
    ingredients: [ { name: 'zalmfilet', qty: 250, unit: 'g' }, { name: 'citroen', qty: 1, unit: 'stuks' }, { name: 'aardappel', qty: 500, unit: 'g' }, { name: 'wortel', qty: 2, unit: 'stuks' } ] },
  { emoji: '🍚', title: 'Nasi goreng', description: 'Gebakken rijst met ei, kip en ketjap.',
    ingredients: [ { name: 'rijst', qty: 300, unit: 'g' }, { name: 'eieren', qty: 2, unit: 'stuks' }, { name: 'kipfilet', qty: 250, unit: 'g' }, { name: 'ketjap', qty: 50, unit: 'ml' }, { name: 'ui', qty: 1, unit: 'stuks' } ] },
  { emoji: '🥙', title: 'Shoarma-wraps', description: 'Mals gekruid vlees met knoflooksaus.',
    ingredients: [ { name: 'kipfilet', qty: 300, unit: 'g' }, { name: 'wraps', qty: 6, unit: 'stuks' }, { name: 'sla', qty: 1, unit: 'stuks' }, { name: 'tomaat', qty: 1, unit: 'stuks' } ] },
  { emoji: '🍲', title: 'Stamppot boerenkool', description: 'Met rookworst en een kuiltje jus.',
    ingredients: [ { name: 'boerenkool', qty: 500, unit: 'g' }, { name: 'aardappel', qty: 1000, unit: 'g' }, { name: 'rookworst', qty: 1, unit: 'stuks' } ] },
  { emoji: '🍳', title: 'Shakshuka', description: 'Eieren gepocheerd in pittige tomatensaus.',
    ingredients: [ { name: 'eieren', qty: 4, unit: 'stuks' }, { name: 'tomatenblik', qty: 400, unit: 'g' }, { name: 'paprika', qty: 1, unit: 'stuks' }, { name: 'ui', qty: 1, unit: 'stuks' } ] },
  { emoji: '🧆', title: 'Falafel-bord', description: 'Met hummus, flatbread en ingelegde groenten.',
    ingredients: [ { name: 'kikkererwten', qty: 400, unit: 'g' }, { name: 'hummus', qty: 200, unit: 'g' }, { name: 'flatbread', qty: 4, unit: 'stuks' }, { name: 'komkommer', qty: 1, unit: 'stuks' } ] },
  { emoji: '🍗', title: 'Kip teriyaki', description: 'Glazige zoet-zoute saus met sesam en rijst.',
    ingredients: [ { name: 'kipfilet', qty: 400, unit: 'g' }, { name: 'sojasaus', qty: 50, unit: 'ml' }, { name: 'rijst', qty: 250, unit: 'g' } ] },
  { emoji: '🥦', title: 'Roerbak met tofu', description: 'Knapperige groenten in gember-sojasaus.',
    ingredients: [ { name: 'tofu', qty: 350, unit: 'g' }, { name: 'paprika', qty: 1, unit: 'stuks' }, { name: 'sojasaus', qty: 40, unit: 'ml' }, { name: 'rijst', qty: 250, unit: 'g' } ] },
  { emoji: '🍔', title: 'Burger-avond', description: 'Sappige burgers met krokante frietjes.',
    ingredients: [ { name: 'gehakt', qty: 400, unit: 'g' }, { name: 'hamburgerbroodjes', qty: 4, unit: 'stuks' }, { name: 'sla', qty: 1, unit: 'stuks' }, { name: 'tomaat', qty: 1, unit: 'stuks' }, { name: 'geraspte kaas', qty: 50, unit: 'g' } ] },
  { emoji: '🫓', title: 'Quesadillas', description: 'Krokant gebakken met kaas, bonen en mais.',
    ingredients: [ { name: 'tortilla', qty: 6, unit: 'stuks' }, { name: 'geraspte kaas', qty: 150, unit: 'g' }, { name: 'bruine bonen', qty: 400, unit: 'g' }, { name: 'mais', qty: 150, unit: 'g' } ] },
  { emoji: '🍤', title: 'Garnalen-pasta', description: 'Knoflook, chili en een scheut witte wijn.',
    ingredients: [ { name: 'garnalen', qty: 200, unit: 'g' }, { name: 'pasta', qty: 250, unit: 'g' }, { name: 'knoflook', qty: 1, unit: 'stuks' }, { name: 'citroen', qty: 1, unit: 'stuks' } ] },
  { emoji: '🥧', title: 'Quiche met spinazie', description: 'Bladerdeeg, eieren en geitenkaas.',
    ingredients: [ { name: 'bladerdeeg', qty: 6, unit: 'stuks' }, { name: 'eieren', qty: 3, unit: 'stuks' }, { name: 'spinazie', qty: 300, unit: 'g' }, { name: 'melk', qty: 500, unit: 'ml' }, { name: 'geitenkaas', qty: 150, unit: 'g' } ] },
  { emoji: '🍠', title: 'Zoete-aardappelcurry', description: 'Vegan, met spinazie en rode linzen.',
    ingredients: [ { name: 'zoete aardappel', qty: 2, unit: 'stuks' }, { name: 'rode linzen', qty: 250, unit: 'g' }, { name: 'kokosmelk', qty: 400, unit: 'ml' }, { name: 'spinazie', qty: 300, unit: 'g' } ] },
  { emoji: '🌯', title: 'Burrito bowl', description: 'Rijst, bonen, salsa en een toef zure room.',
    ingredients: [ { name: 'rijst', qty: 250, unit: 'g' }, { name: 'bruine bonen', qty: 400, unit: 'g' }, { name: 'mais', qty: 150, unit: 'g' }, { name: 'zure room', qty: 125, unit: 'ml' }, { name: 'avocado', qty: 1, unit: 'stuks' } ] },
  { emoji: '🍲', title: 'Goulash', description: 'Stevige stoof met paprika en rundvlees.',
    ingredients: [ { name: 'rundvlees', qty: 500, unit: 'g' }, { name: 'paprika', qty: 2, unit: 'stuks' }, { name: 'ui', qty: 1, unit: 'stuks' }, { name: 'tomatenblik', qty: 400, unit: 'g' } ] },
  { emoji: '🥟', title: 'Gyoza & rijst', description: 'Gebakken dumplings met een dipsaus.',
    ingredients: [ { name: 'gyoza', qty: 20, unit: 'stuks' }, { name: 'rijst', qty: 250, unit: 'g' }, { name: 'sojasaus', qty: 30, unit: 'ml' } ] },
  { emoji: '🧀', title: 'Mac & cheese', description: 'Romige kaassaus met een krokant korstje.',
    ingredients: [ { name: 'pasta', qty: 300, unit: 'g' }, { name: 'melk', qty: 500, unit: 'ml' }, { name: 'geraspte kaas', qty: 200, unit: 'g' }, { name: 'boter', qty: 30, unit: 'g' } ] },
]

// Vaste-deck ingrediënten opzoekbaar op dish-id (slug). Matches/menu verwijzen
// alleen met een id naar een gerecht; hiermee halen we de ingrediënten terug.
const INGREDIENTS_BY_ID: Record<string, DishIngredient[]> = Object.fromEntries(
  STATIC_DECK.filter((d) => d.ingredients).map((d) => [
    slugify(d.title),
    d.ingredients as DishIngredient[],
  ])
)

export function dishIngredientsById(id: string): DishIngredient[] {
  return INGREDIENTS_BY_ID[id] ?? []
}

// Husselt een kopie (Fisher–Yates) zodat de bron-array niet muteert.
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// De standaard-deck, gehusseld en voorzien van stabiele id's.
export function defaultDeck(): DishIdea[] {
  return shuffle(STATIC_DECK).map((d) => ({ ...d, id: slugify(d.title) }))
}

const SYSTEM_PROMPT = `Je bent een enthousiaste Nederlandse thuiskok.
Je stelt een gevarieerde lijst avondmaaltijden voor om uit te kiezen.
Geef ALLEEN JSON terug (geen uitleg eromheen) met deze structuur:
{
  "dishes": [
    { "emoji": "🍝", "title": "Naam van het gerecht", "description": "Eén korte, verleidelijke zin." }
  ]
}
Gebruik telkens precies één passende emoji per gerecht.`

interface AnthropicTextBlock {
  type: string
  text?: string
}
interface AnthropicResponse {
  content?: AnthropicTextBlock[]
  error?: { message?: string }
}

function extractDishes(text: string): DishIdea[] {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Geen JSON gevonden in het antwoord.')
  }
  const parsed = JSON.parse(text.slice(start, end + 1)) as {
    dishes?: Omit<DishIdea, 'id'>[]
  }
  const dishes = parsed.dishes ?? []
  return dishes
    .filter((d) => d.title)
    .map((d) => ({
      id: slugify(d.title),
      emoji: d.emoji || '🍽️',
      title: d.title,
      description: d.description || '',
    }))
}

// Vraagt de kok om een verse deck. Valt buiten de proxy terug op een
// directe browser-aanroep (sleutel zichtbaar — zie recipe.ts/README).
export async function generateDishIdeas(count = 12): Promise<DishIdea[]> {
  if (!isDishAiEnabled) {
    throw new Error('AI-suggesties staan uit (geen proxy of API-sleutel).')
  }

  const userMessage = `Stel ${count} gevarieerde avondmaaltijden voor (verschillende keukens, mix van vlees, vis en vega).`

  const res = PROXY_URL
    ? await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // De uitgebreide proxy ondersteunt mode "dishes"; oudere proxy's
        // negeren dit en geven (alleen) een recept terug.
        body: JSON.stringify({ mode: 'dishes', count }),
      })
    : await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY as string,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1200,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

  if (!res.ok) {
    let detail = ''
    try {
      const err = (await res.json()) as AnthropicResponse
      detail = err?.error?.message || ''
    } catch {
      /* negeer parse-fout */
    }
    throw new Error(`Suggesties ophalen mislukt (${res.status}). ${detail}`.trim())
  }

  const data = (await res.json()) as AnthropicResponse
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n')

  const ideas = extractDishes(text)
  if (!ideas.length) throw new Error('De kok stelde geen gerechten voor.')
  return ideas
}
