import { isSaleExpired, formatShortDate } from '../../lib/dates'

// Aanbiedings-badge. Verlopen aanbiedingen worden uitgetint getoond.
export default function SaleBadge({ ingredient, showDate = false }) {
  if (!ingredient?.onSale) return null

  const expired = isSaleExpired(ingredient.saleUntil)
  const label = ingredient.saleLabel || 'Aanbieding'
  const store = ingredient.saleStore ? `${ingredient.saleStore} · ` : ''

  return (
    <span
      className={`sale-badge${expired ? ' sale-badge--expired' : ''}`}
      title={
        ingredient.saleUntil
          ? `Geldig t/m ${formatShortDate(ingredient.saleUntil)}`
          : undefined
      }
    >
      {expired ? '⏳' : '🏷️'} {store}
      {label}
      {showDate && ingredient.saleUntil
        ? ` (t/m ${formatShortDate(ingredient.saleUntil)})`
        : ''}
    </span>
  )
}
