import { useMemo, useState } from 'react'
import { Search, Tag } from 'lucide-react'
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
        <div className="search-wrap">
          <Search
            className="search-wrap__icon"
            size={17}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="search"
            className="search-input search-input--icon"
            placeholder="Zoek een ingrediënt…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="chip-toggle"
          aria-pressed={onlySales}
          onClick={() => setOnlySales((v) => !v)}
        >
          <Tag size={14} strokeWidth={1.75} /> Alleen aanbiedingen
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">
            <Search size={40} strokeWidth={1.5} />
          </span>
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
            <CategoryHeader name={group.name} count={group.items.length} />
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
