import type { StoreName } from '../../types'

interface StoreBadgesProps {
  stores: StoreName[] | undefined
}

// Kleine, monochrome tekst-badges per winkel (AH / Lidl / Deka) — neutrale
// hairline-chips, géén luide merkkleuren. Stijl staat in components.css.
export default function StoreBadges({ stores }: StoreBadgesProps) {
  if (!stores || !stores.length) return null
  return (
    <span className="store-badges">
      {stores.map((store) => (
        <span key={store} className={`store-badge store-badge--${store}`}>
          {store}
        </span>
      ))}
    </span>
  )
}
