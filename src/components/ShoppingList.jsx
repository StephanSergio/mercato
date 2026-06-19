import { useMemo } from 'react'
import CategoryHeader from './ui/CategoryHeader'
import SaleBadge from './ui/SaleBadge'
import { isActiveSale } from '../lib/dates'

// Winkellijst (QuickView). Items gegroepeerd per categorie in vaste volgorde.
// Aangevinkte items zakken naar onderen binnen hun categorie.
export default function ShoppingList({
  items,
  categories,
  ingredients,
  onToggle,
  onRemove,
  onClearChecked,
}) {
  // Map ingredientId -> ingredient (voor actuele aanbiedingsinfo).
  const ingredientById = useMemo(() => {
    const m = new Map()
    ingredients.forEach((ing) => m.set(ing.id, ing))
    return m
  }, [ingredients])

  const total = items.length
  const done = items.filter((i) => i.checked).length

  // Volgorde van categorieën op basis van `order`.
  const categoryOrder = useMemo(() => {
    const m = new Map()
    categories.forEach((c) => m.set(c.name, c))
    return m
  }, [categories])

  // Groepeer per categorie, sorteer groepen op order, items: open eerst.
  const groups = useMemo(() => {
    const byCat = new Map()
    items.forEach((item) => {
      const key = item.category || 'Overig'
      if (!byCat.has(key)) byCat.set(key, [])
      byCat.get(key).push(item)
    })

    const arr = [...byCat.entries()].map(([name, list]) => {
      const cat = categoryOrder.get(name)
      list.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1
        return (a.name || '').localeCompare(b.name || '', 'nl')
      })
      return {
        name,
        icon: cat?.icon || '📦',
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
        <span className="empty-state__emoji">🛒</span>
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
        <div className="progress__label">
          {done} van {total} items gedaan
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
          <CategoryHeader
            icon={group.icon}
            name={group.name}
            count={group.items.length}
          />
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
                    {item.checked ? '✓' : ''}
                  </span>
                  <span className="check-row__body">
                    <span className="check-row__name">{item.name}</span>
                    <span className="check-row__meta">
                      {item.addedBy && (
                        <span className="check-row__added-by">
                          door {item.addedBy}
                        </span>
                      )}
                      {showSale && <SaleBadge ingredient={ing} />}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className="check-row__remove"
                  onClick={() => onRemove(item.id)}
                  aria-label="Verwijder van lijst"
                >
                  ×
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
          🧹 Aangevinkte items verwijderen ({done})
        </button>
      )}
    </div>
  )
}
