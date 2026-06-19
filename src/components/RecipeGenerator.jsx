import { useState } from 'react'
import RecipeCard from './ui/RecipeCard'
import { generateRecipe, isRecipeEnabled } from '../lib/recipe'

// Normaliseert een naam voor losse matching.
const norm = (s) => (s || '').toLowerCase().trim()

// Bepaalt of een recept-ingrediënt al (ongeveer) op de lijst staat.
function alreadyOnList(recipeName, listNames) {
  const r = norm(recipeName)
  return listNames.some((n) => r.includes(n) || n.includes(r))
}

export default function RecipeGenerator({
  shoppingItems,
  ingredients,
  onAddToList,
}) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  // Ingrediënten die momenteel op de winkellijst staan.
  const listNames = shoppingItems.map((i) => i.name)

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setAdded(false)
    try {
      const result = await generateRecipe(listNames)
      setRecipe(result)
    } catch (e) {
      setError(e.message || 'Er ging iets mis.')
      setRecipe(null)
    } finally {
      setLoading(false)
    }
  }

  // Voegt recept-ingrediënten toe die nog niet op de lijst staan.
  function handleAddMissing() {
    if (!recipe?.ingredients) return
    const listLower = listNames.map(norm)

    recipe.ingredients.forEach((ing) => {
      if (alreadyOnList(ing.name, listLower)) return

      // Probeer te koppelen aan een bestaand DB-ingrediënt; anders vrije tekst.
      const match = ingredients.find((db) => {
        const a = norm(db.name)
        const b = norm(ing.name)
        return b.includes(a) || a.includes(b)
      })

      if (match) {
        onAddToList({ id: match.id, name: match.name, category: match.category })
      } else {
        onAddToList({ id: '', name: ing.name, category: 'Overig' })
      }
    })
    setAdded(true)
  }

  if (!isRecipeEnabled) {
    return (
      <div className="banner banner--warn">
        <div className="banner__title">Receptenfunctie staat uit</div>
        Stel een Anthropic API-sleutel in via <code>VITE_ANTHROPIC_API_KEY</code>{' '}
        om recepten te laten voorstellen. Zie de README voor uitleg (en de
        veiligere proxy-variant).
      </div>
    )
  }

  return (
    <div>
      <p className="section-intro">
        Op basis van wat er nú op je winkellijst staat, stelt de kok één recept
        voor.
      </p>

      <div className="recipe-source">
        <div className="recipe-source__title">
          Op je lijst ({listNames.length})
        </div>
        {listNames.length === 0 ? (
          <p className="muted">
            Je lijst is leeg. Voeg eerst ingrediënten toe.
          </p>
        ) : (
          <div className="recipe-source__list">
            {listNames.map((name, i) => (
              <span key={i} className="recipe-source__chip">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {!recipe && (
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={handleGenerate}
          disabled={loading || listNames.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner" /> Even koken…
            </>
          ) : (
            '👨‍🍳 Stel een recept voor'
          )}
        </button>
      )}

      {error && (
        <div className="banner banner--error" style={{ marginTop: 16 }}>
          <div className="banner__title">Oeps</div>
          {error}
        </div>
      )}

      {recipe && (
        <>
          <RecipeCard recipe={recipe} />
          <div className="recipe-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Even koken…
                </>
              ) : (
                '🔄 Nieuw recept'
              )}
            </button>
            <button
              type="button"
              className="btn btn--sage"
              onClick={handleAddMissing}
              disabled={added}
            >
              {added ? '✓ Toegevoegd' : '➕ Ontbrekende ingrediënten toevoegen'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
