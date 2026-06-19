// Kleine gekleurde tekst-badges per winkel: AH (blauw), Lidl (blauw/geel), Deka (rood).
export default function StoreBadges({ stores }) {
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
