// ============================================================
// Firebase Cloud Function: recept-proxy voor de Anthropic API.
// ------------------------------------------------------------
// Houdt de Anthropic-sleutel SERVER-SIDE. De browser stuurt alleen
// { ingredients: [...] }; deze functie voegt de sleutel toe en roept
// Claude aan. Zet de frontend-variabele VITE_RECIPE_PROXY_URL op de
// URL van deze functie om hem te gebruiken.
//
// Sleutel instellen (eenmalig):
//   firebase functions:secrets:set ANTHROPIC_API_KEY
//
// Deployen:
//   firebase deploy --only functions
// ============================================================

const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY')

const MODEL = 'claude-sonnet-4-6'

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

// Prompt voor het Match-scherm: een deck gerecht-suggesties om te swipen.
const DISHES_SYSTEM_PROMPT = `Je bent een enthousiaste Nederlandse thuiskok.
Je stelt een gevarieerde lijst avondmaaltijden voor om uit te kiezen.
Geef ALLEEN JSON terug (geen uitleg eromheen) met deze structuur:
{
  "dishes": [
    { "emoji": "🍝", "title": "Naam van het gerecht", "description": "Eén korte, verleidelijke zin." }
  ]
}
Gebruik telkens precies één passende emoji per gerecht.`

// Prompt voor CleanFit's Meals-scherm: gezonde, caloriearme seizoensmaaltijden.
const MEALS_SYSTEM_PROMPT = `You are a nutritionist. Suggest healthy, lower-calorie meals that use produce in season for the given season.
Return ONLY JSON (no prose) in this exact shape:
{
  "breakfast": [ { "name": "…", "kcal": 280, "description": "one short sentence", "tags": ["veg"] } ],
  "lunch":     [ … ],
  "dinner":    [ … ],
  "snack":     [ … ]
}
Give 3 items per meal type. kcal is a realistic per-serving estimate. tags are from: "veg", "vegan", "high-protein". One short sentence per description.`

// Beperk welke origins de proxy mogen aanroepen. Pas aan naar jouw domein(en).
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5180',
  'https://stephansergio.github.io',
]

exports.recipe = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: ALLOWED_ORIGINS },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: { message: 'Alleen POST toegestaan.' } })
      return
    }

    // Drie modi delen deze proxy:
    //   • standaard: { ingredients: [...] }       → één recept (Mercato)
    //   • Match-scherm: { mode: "dishes", count }  → deck gerecht-suggesties
    //   • CleanFit Meals: { mode: "meals", season } → seizoensmaaltijden (JSON)
    const mode =
      req.body?.mode === 'dishes' ? 'dishes'
      : req.body?.mode === 'meals' ? 'meals'
      : 'recipe'

    let system
    let userContent
    let maxTokens

    if (mode === 'dishes') {
      const count = Math.min(Math.max(Number(req.body?.count) || 12, 1), 24)
      system = DISHES_SYSTEM_PROMPT
      userContent = `Stel ${count} gevarieerde avondmaaltijden voor (verschillende keukens, mix van vlees, vis en vega).`
      maxTokens = 1200
    } else if (mode === 'meals') {
      const allowed = ['spring', 'summer', 'autumn', 'winter']
      const season = allowed.includes(req.body?.season) ? req.body.season : 'summer'
      system = MEALS_SYSTEM_PROMPT
      userContent = `Season: ${season}. Suggest seasonal meals.`
      maxTokens = 1500
    } else {
      const ingredients = req.body?.ingredients
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        res
          .status(400)
          .json({ error: { message: 'Geef een niet-lege "ingredients" array.' } })
        return
      }
      system = SYSTEM_PROMPT
      userContent = `Mijn ingrediënten: ${ingredients.join(
        ', '
      )}. Stel een recept voor.`
      maxTokens = 1000
    }

    try {
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY.value(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: userContent }],
        }),
      })

      const data = await apiRes.json()
      // Geef de Anthropic-respons rechtstreeks door; de client parsed deze.
      res.status(apiRes.status).json(data)
    } catch (e) {
      res
        .status(502)
        .json({ error: { message: 'Proxy-fout: ' + (e.message || e) } })
    }
  }
)
