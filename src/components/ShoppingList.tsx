import { useMemo } from 'react'
import { Check, X, Trash2, ShoppingCart, Minus, Plus } from 'lucide-react'
import CategoryHeader from './ui/CategoryHeader'
import SaleBadge from './ui/SaleBadge'
import { isActiveSale } from '../lib/dates'
import type { Category, Ingredient, ShoppingItem } from '../types'

interface ShoppingListProps {
  items: ShoppingItem[]
  categories: Category[]
  ingredients: Ingredient[]
  onToggle: (item: ShoppingItem) => void
  onSetQty: (item: ShoppingItem, qty: number) => void
  onRemove: (id: string) => void
  onClearChecked: () => void
}

interface Group {
  name: string
  order: number
  items: ShoppingItem[]
}

// Winkellijst (QuickView). Items gegroepeerd per categorie in vaste volgorde.
// Aangevinkte items zakken naar onderen binnen hun categorie.
export default function ShoppingList({
  items,
  categories,
  ingredients,
  onToggle,
  onSetQty,
  onRemove,
  onClearChecked,
}: ShoppingListProps) {
  // Map ingredientId -> ingredient (voor actuele aanbiedingsinfo).
  const ingredientById = useMemo(() => {
    const m = new Map<string, Ingredient>()
    ingredients.forEach((ing) => m.set(ing.id, ing))
    return m
  }, [ingredients])

  const total = items.length
  const done = items.filter((i) => i.checked).length

  // Volgorde van categorieën op basis van `order`.
  const categoryOrder = useMemo(() => {
    const m = new Map<string, Category>()
    categories.forEach((c) => m.set(c.name, c))
    return m
  }, [categories])

  // Groepeer per categorie, sorteer groepen op order, items: open eerst.
  const groups = useMemo<Group[]>(() => {
    const byCat = new Map<string, ShoppingItem[]>()
    items.forEach((item) => {
      const key = item.category || 'Overig'
      if (!byCat.has(key)) byCat.set(key, [])
      byCat.get(key)!.push(item)
    })

    const arr: Group[] = [...byCat.entries()].map(([name, list]) => {
      const cat = categoryOrder.get(name)
      list.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1
        return (a.name || '').localeCompare(b.name || '', 'nl')
      })
      return {
        name,
        order: cat?.order ?? 999,
        items: list,
      }
    })

    arr.sort((a, b) => a.order - b.order)
    return arr
  }, [items, categoryOrder])

  if (total === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon" aria-hidden="true">
          <ShoppingCart size={40} strokeWidth={1.5} />
        </span>
        <p>Je winkellijst is nog leeg.</p>
        <p className="muted">
          Ga naar <strong>Ingrediënten</strong> en tik items aan om ze toe te
          voegen.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="progress">
        <div className="progress__head">
          <span className="progress__label">Afgevinkt</span>
          <span className="progress__count">
            {done} / {total}
          </span>
        </div>
        <div className="progress__bar">
          <div
            className="progress__fill"
            style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.name}>
          <CategoryHeader name={group.name} count={group.items.length} />
          {group.items.map((item) => {
            const ing = ingredientById.get(item.ingredientId)
            const showSale = ing && isActiveSale(ing)
            return (
              <div
                key={item.id}
                className={`check-row${item.checked ? ' check-row--checked' : ''}${
                  showSale ? ' check-row--sale' : ''
                }`}
              >
                <button
                  type="button"
                  className="check-row__main"
                  onClick={() => onToggle(item)}
                  aria-label={item.checked ? 'Vink uit' : 'Vink af'}
                >
                  <span
                    className={`check-row__box${
                      item.checked ? ' check-row__box--checked' : ''
                    }`}
                    aria-hidden="true"
                  >
                    {item.checked && <Check size={16} strokeWidth={3} />}
                  </span>
                  <span className="check-row__body">
                    <span className="leader">
                      <span className="leader__name check-row__name">
                        {item.name}
                      </span>
                      {ing?.unit && (
                        <span className="leader__num">{ing.unit}</span>
                      )}
                    </span>
                    <span className="check-row__meta">
                      {item.addedBy && (
                        <span className="check-row__added-by">
                          door {item.addedBy}
                        </span>
                      )}
                      {showSale && ing && <SaleBadge ingredient={ing} />}
                    </span>
                  </span>
                </button>
                <div className="qty-stepper" aria-label="Aantal">
                  <button
                    type="button"
                    className="qty-stepper__btn"
                    onClick={() => onSetQty(item, (item.qty ?? 1) - 1)}
                    disabled={(item.qty ?? 1) <= 1}
                    aria-label="Eén minder"
                  >
                    <Minus size={15} strokeWidth={2.25} />
                  </button>
                  <span className="qty-stepper__val">{item.qty ?? 1}</span>
                  <button
                    type="button"
                    className="qty-stepper__btn"
                    onClick={() => onSetQty(item, (item.qty ?? 1) + 1)}
                    aria-label="Eén meer"
                  >
                    <Plus size={15} strokeWidth={2.25} />
                  </button>
                </div>
                <button
                  type="button"
                  className="check-row__remove"
                  onClick={() => onRemove(item.id)}
                  aria-label="Verwijder van lijst"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            )
          })}
        </section>
      ))}

      {done > 0 && (
        <button
          type="button"
          className="btn btn--ghost btn--block"
          style={{ marginTop: 20 }}
          onClick={onClearChecked}
        >
          <Trash2 size={16} strokeWidth={1.75} /> Aangevinkte items verwijderen (
          {done})
        </button>
      )}
    </div>
  )
}
