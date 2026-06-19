interface CategoryHeaderProps {
  icon?: string
  name: string
  count?: number
}

// Categorie-kop met emoji + naam, en optioneel een teller rechts.
export default function CategoryHeader({
  icon,
  name,
  count,
}: CategoryHeaderProps) {
  return (
    <div className="category-header">
      <span className="category-header__icon" aria-hidden="true">
        {icon || '📦'}
      </span>
      <h2 className="category-header__name">{name}</h2>
      {typeof count === 'number' && (
        <span className="category-header__count">{count}</span>
      )}
    </div>
  )
}
