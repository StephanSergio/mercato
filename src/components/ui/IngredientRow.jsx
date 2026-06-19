import StoreBadges from './StoreBadges'
import SaleBadge from './SaleBadge'
import { isActiveSale } from '../../lib/dates'

// Eén rij in de ingrediëntenlijst (Browser). Grote aantikvlak: hele rij is een knop.
// `onList` markeert dat het al op de winkellijst staat (sage groen randje).
export default function IngredientRow({ ingredient, onList, onToggle }) {
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
        <span className="ingredient-row__name">{ingredient.name}</span>
        <span className="ingredient-row__meta">
          {ingredient.unit && (
            <span className="ingredient-row__unit">{ingredient.unit}</span>
          )}
          <StoreBadges stores={ingredient.store} />
          {ingredient.onSale && <SaleBadge ingredient={ingredient} />}
        </span>
      </span>
      <span
        className={`ingredient-row__indicator${
          onList ? ' ingredient-row__indicator--active' : ''
        }`}
        aria-hidden="true"
      >
        {onList ? '✓' : '+'}
      </span>
    </button>
  )
}
