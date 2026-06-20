// ============================================================
// Gerecht-suggesties voor het Match-scherm ("Tinder voor eten").
// ------------------------------------------------------------
// Werkt out-of-the-box met een vaste deck van gerechten. Als er een
// Anthropic-sleutel of proxy is ingesteld, kan de kok een verse deck
// voorstellen via `generateDishIdeas()` (zelfde proxy als recepten).
// ============================================================

import type { DishIdea } from '../types'

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
  { emoji: '🍝', title: 'Spaghetti Bolognese', description: 'Romige tomatensaus met gehakt, lang gestoofd.' },
  { emoji: '🌮', title: 'Taco-avond', description: 'Zelf opbouwen met gekruid vlees, mais en avocado.' },
  { emoji: '🍛', title: 'Indiase curry', description: 'Milde kerrie met kikkererwten en kokosmelk.' },
  { emoji: '🍕', title: 'Zelfgemaakte pizza', description: 'Knapperige bodem, ieder zijn eigen beleg.' },
  { emoji: '🥘', title: 'Risotto met paddenstoelen', description: 'Romig, met Parmezaan en verse tijm.' },
  { emoji: '🍜', title: 'Noedelsoep', description: 'Pittige bouillon met groenten en ei.' },
  { emoji: '🥗', title: 'Griekse salade-bowl', description: 'Feta, olijven, komkommer en een frisse dressing.' },
  { emoji: '🐟', title: 'Zalm uit de oven', description: 'Met citroen, dille en geroosterde groenten.' },
  { emoji: '🍚', title: 'Nasi goreng', description: 'Gebakken rijst met ei, kip en ketjap.' },
  { emoji: '🥙', title: 'Shoarma-wraps', description: 'Mals gekruid vlees met knoflooksaus.' },
  { emoji: '🍲', title: 'Stamppot boerenkool', description: 'Met rookworst en een kuiltje jus.' },
  { emoji: '🍳', title: 'Shakshuka', description: 'Eieren gepocheerd in pittige tomatensaus.' },
  { emoji: '🧆', title: 'Falafel-bord', description: 'Met hummus, flatbread en ingelegde groenten.' },
  { emoji: '🍗', title: 'Kip teriyaki', description: 'Glazige zoet-zoute saus met sesam en rijst.' },
  { emoji: '🥦', title: 'Roerbak met tofu', description: 'Knapperige groenten in gember-sojasaus.' },
  { emoji: '🍔', title: 'Burger-avond', description: 'Sappige burgers met krokante frietjes.' },
  { emoji: '🫓', title: 'Quesadillas', description: 'Krokant gebakken met kaas, bonen en mais.' },
  { emoji: '🍤', title: 'Garnalen-pasta', description: 'Knoflook, chili en een scheut witte wijn.' },
  { emoji: '🥧', title: 'Quiche met spinazie', description: 'Bladerdeeg, eieren en geitenkaas.' },
  { emoji: '🍠', title: 'Zoete-aardappelcurry', description: 'Vegan, met spinazie en rode linzen.' },
  { emoji: '🌯', title: 'Burrito bowl', description: 'Rijst, bonen, salsa en een toef zure room.' },
  { emoji: '🍲', title: 'Goulash', description: 'Stevige stoof met paprika en rundvlees.' },
  { emoji: '🥟', title: 'Gyoza & rijst', description: 'Gebakken dumplings met een dipsaus.' },
  { emoji: '🧀', title: 'Mac & cheese', description: 'Romige kaassaus met een krokant korstje.' },
]

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
