import { useMemo, useState } from 'react'
import CategoryHeader from './ui/CategoryHeader'
import IngredientRow from './ui/IngredientRow'
import { isActiveSale } from '../lib/dates'
import type { Category, Ingredient } from '../types'

interface IngredientBrowserProps {
  ingredients: Ingredient[]
  categories: Category[]
  onListIngredientIds: Set<string>
  onToggleIngredient: (ingredient: Ingredient) => void
}

interface Group {
  name: string
  icon: string
  order: number
  items: Ingredient[]
}

// Ingrediënten bladeren, gegroepeerd per categorie. Zoekbalk + aanbiedingsfilter.
// Tik een item aan om toe te voegen aan / verwijderen van de winkellijst.
export default function IngredientBrowser({
  ingredients,
  categories,
  onListIngredientIds,
  onToggleIngredient,
}: IngredientBrowserProps) {
  const [search, setSearch] = useState('')
  const [onlySales, setOnlySales] = useState(false)

  const categoryOrder = useMemo(() => {
    const m = new Map<string, Category>()
    categories.forEach((c) => m.set(c.name, c))
    return m
  }, [categories])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return ingredients.filter((ing) => {
      if (onlySales && !isActiveSale(ing)) return false
      if (term && !ing.name.toLowerCase().includes(term)) return false
      return true
    })
  }, [ingredients, search, onlySales])

  const groups = useMemo<Group[]>(() => {
    const byCat = new Map<string, Ingredient[]>()
    filtered.forEach((ing) => {
      const key = ing.category || 'Overig'
      if (!byCat.has(key)) byCat.set(key, [])
      byCat.get(key)!.push(ing)
    })
    const arr: Group[] = [...byCat.entries()].map(([name, list]) => {
      const cat = categoryOrder.get(name)
      list.sort((a, b) => a.name.localeCompare(b.name, 'nl'))
      return {
        name,
        icon: cat?.icon || '📦',
        order: cat?.order ?? 999,
        items: list,
      }
    })
    arr.sort((a, b) => a.order - b.order)
    return arr
  }, [filtered, categoryOrder])

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Zoek een ingrediënt…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="chip-toggle"
          aria-pressed={onlySales}
          onClick={() => setOnlySales((v) => !v)}
        >
          🏷️ Alleen aanbiedingen
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🔍</span>
          <p>Geen ingrediënten gevonden.</p>
          {ingredients.length === 0 && (
            <p className="muted">
              Vul eerst de database via <strong>Beheer</strong>.
            </p>
          )}
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.name}>
            <CategoryHeader
              icon={group.icon}
              name={group.name}
              count={group.items.length}
            />
            {group.items.map((ing) => (
              <IngredientRow
                key={ing.id}
                ingredient={ing}
                onList={onListIngredientIds.has(ing.id)}
                onToggle={onToggleIngredient}
              />
            ))}
          </section>
        ))
      )}
    </div>
  )
}
