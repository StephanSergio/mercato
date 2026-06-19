import { Plus, Check } from 'lucide-react'
import StoreBadges from './StoreBadges'
import SaleBadge from './SaleBadge'
import { isActiveSale } from '../../lib/dates'
import type { Ingredient } from '../../types'

interface IngredientRowProps {
  ingredient: Ingredient
  onList: boolean
  onToggle: (ingredient: Ingredient) => void
}

// Eén rij in de ingrediëntenlijst (Browser). Grote aantikvlak: hele rij is een knop.
// Signature: naam ···· eenheid (leader). `onList` → sage linkerrand + ✓.
export default function IngredientRow({
  ingredient,
  onList,
  onToggle,
}: IngredientRowProps) {
  const activeSale = isActiveSale(ingredient)

  const classes = [
    'ingredient-row',
    onList ? 'ingredient-row--on-list' : '',
    activeSale ? 'ingredient-row--sale' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onToggle(ingredient)}
      aria-pressed={onList}
    >
      <span className="ingredient-row__body">
        <span className="leader">
          <span className="leader__name">{ingredient.name}</span>
          <span className="leader__dots" aria-hidden="true" />
          {ingredient.unit && (
            <span className="leader__num">{ingredient.unit}</span>
          )}
        </span>
        {(ingredient.store?.length || ingredient.onSale) && (
          <span className="ingredient-row__meta">
            <StoreBadges stores={ingredient.store} />
            {ingredient.onSale && <SaleBadge ingredient={ingredient} />}
          </span>
        )}
      </span>
      <span
        className={`ingredient-row__indicator${
          onList ? ' ingredient-row__indicator--active' : ''
        }`}
        aria-hidden="true"
      >
        {onList ? (
          <Check size={16} strokeWidth={2.5} />
        ) : (
          <Plus size={16} strokeWidth={2.5} />
        )}
      </span>
    </button>
  )
}
