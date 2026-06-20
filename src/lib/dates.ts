// Helpers rond aanbiedingsdatums.

import type { Ingredient, WeekdayKey } from '../types'

// ── Weekdagen + ISO-weeknummer (voor het Match-/menuscherm) ──

export const WEEKDAYS: { key: WeekdayKey; short: string; long: string }[] = [
  { key: 'ma', short: 'Ma', long: 'Maandag' },
  { key: 'di', short: 'Di', long: 'Dinsdag' },
  { key: 'wo', short: 'Wo', long: 'Woensdag' },
  { key: 'do', short: 'Do', long: 'Donderdag' },
  { key: 'vr', short: 'Vr', long: 'Vrijdag' },
  { key: 'za', short: 'Za', long: 'Zaterdag' },
  { key: 'zo', short: 'Zo', long: 'Zondag' },
]

// JS getDay(): 0 = zondag … 6 = zaterdag → onze ma-eerst volgorde.
const KEY_BY_JS_DAY: WeekdayKey[] = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

// Weekdag-sleutel van een datum (default: vandaag).
export function weekdayKeyOf(date: Date = new Date()): WeekdayKey {
  return KEY_BY_JS_DAY[date.getDay()]
}

// Stabiele ID voor de ISO-week, bv. "2026-W25". Stemmen en het weekmenu
// worden hierop gescoped, zodat een nieuwe week schoon begint.
export function isoWeekId(date: Date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  // Donderdag van deze week bepaalt het jaar (ISO-8601).
  const dayNr = (d.getUTCDay() + 6) % 7 // ma=0 … zo=6
  d.setUTCDate(d.getUTCDate() - dayNr + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const firstDayNr = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNr + 3)
  const week =
    1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 864e5))
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

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
