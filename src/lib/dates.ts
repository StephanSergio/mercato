// Helpers rond aanbiedingsdatums.

import type { Ingredient } from '../types'

type SaleInfo = Pick<Ingredient, 'onSale' | 'saleUntil'>

// `saleUntil` is opgeslagen als "YYYY-MM-DD". Verlopen = datum in het verleden.
export function isSaleExpired(saleUntil: string | undefined): boolean {
  if (!saleUntil) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const until = new Date(saleUntil + 'T23:59:59')
  return until < today
}

// Een ingrediënt is "actief in de aanbieding" als onSale én niet verlopen.
export function isActiveSale(
  ingredient: SaleInfo | null | undefined
): boolean {
  return Boolean(ingredient?.onSale) && !isSaleExpired(ingredient?.saleUntil)
}

// Toont datum als "22 jun" voor een compacte weergave.
export function formatShortDate(saleUntil: string | undefined): string {
  if (!saleUntil) return ''
  const d = new Date(saleUntil + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return saleUntil
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}
