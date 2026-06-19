import { Tag, Hourglass } from 'lucide-react'
import { isSaleExpired, formatShortDate } from '../../lib/dates'
import type { Ingredient } from '../../types'

interface SaleBadgeProps {
  ingredient: Pick<
    Ingredient,
    'onSale' | 'saleStore' | 'saleLabel' | 'saleUntil'
  >
  showDate?: boolean
}

// Aanbiedings-badge. Verlopen aanbiedingen worden uitgetint getoond.
export default function SaleBadge({
  ingredient,
  showDate = false,
}: SaleBadgeProps) {
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
      {expired ? (
        <Hourglass size={11} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Tag size={11} strokeWidth={2} aria-hidden="true" />
      )}
      {expired ? 'Verlopen' : `${store}${label}`}
      {showDate && !expired && ingredient.saleUntil
        ? ` (t/m ${formatShortDate(ingredient.saleUntil)})`
        : ''}
    </span>
  )
}
