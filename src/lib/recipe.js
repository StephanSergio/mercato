// ============================================================
// Claude API-aanroep voor het receptenscherm.
// ------------------------------------------------------------
// GitHub Pages is statische hosting (geen backend), dus we roepen
// de Anthropic API rechtstreeks vanuit de browser aan. Dat vereist
// de header `anthropic-dangerous-direct-browser-access`. Houd er
// rekening mee dat de API-sleutel hierdoor zichtbaar is in de
// browser. Zie README voor de veiligere proxy-variant.
// ============================================================

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
// Optionele proxy (Firebase Function / Worker). Als deze is gezet, gaat de
// aanroep via de proxy en blijft de API-sleutel server-side. Zie functions/.
const PROXY_URL = import.meta.env.VITE_RECIPE_PROXY_URL
const MODEL = 'claude-sonnet-4-6'

// Recepten werken als er óf een proxy óf een directe sleutel is.
export const isRecipeEnabled = Boolean(PROXY_URL || API_KEY)

const SYSTEM_PROMPT = `Je bent een enthousiaste Nederlandse thuiskok in de stijl van Jamie Oliver.
Je krijgt een lijst ingrediënten en stelt één concreet, heerlijk recept voor dat de meeste van deze ingrediënten gebruikt.
Geef het recept terug als JSON met deze structuur (ALLEEN JSON, geen uitleg erbuiten):
{
  "title": "Naam van het recept",
  "servings": 4,
  "prepTime": "15 minuten",
  "cookTime": "25 minuten",
  "description": "Één zin die het gerecht verleidelijk beschrijft.",
  "ingredients": [
    { "amount": "400g", "name": "kipfilet, in stukken" }
  ],
  "steps": [
    "Stap 1: ...",
    "Stap 2: ..."
  ],
  "tip": "Een praktische tip van Jamie-stijl."
}`

// Pakt het eerste JSON-object uit de tekst (model kan soms tekst eromheen zetten).
function extractJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Geen JSON gevonden in het antwoord.')
  }
  return JSON.parse(text.slice(start, end + 1))
}

export async function generateRecipe(ingredientList) {
  if (!isRecipeEnabled) {
    throw new Error(
      'Receptenfunctie staat uit (geen proxy of API-sleutel ingesteld).'
    )
  }
  if (!ingredientList.length) {
    throw new Error('Je winkellijst is leeg — voeg eerst ingrediënten toe.')
  }

  const res = PROXY_URL
    ? // Via proxy: sleutel blijft server-side, alleen de ingrediënten gaan mee.
      await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientList }),
      })
    : // Direct vanuit de browser (sleutel zichtbaar in de bundle).
      await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          // Vereist om de API rechtstreeks vanuit de browser te mogen aanroepen.
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Mijn ingrediënten: ${ingredientList.join(
                ', '
              )}. Stel een recept voor.`,
            },
          ],
        }),
      })

  if (!res.ok) {
    let detail = ''
    try {
      const err = await res.json()
      detail = err?.error?.message || ''
    } catch {
      /* negeer parse-fout */
    }
    throw new Error(
      `Recept ophalen mislukt (${res.status}). ${detail}`.trim()
    )
  }

  const data = await res.json()
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')

  return extractJson(text)
}
