import CategoryIcon from '../../lib/categoryIcon'

interface CategoryHeaderProps {
  name: string
  count?: number
}

// Categorie-kop: Lucide-icoon + label, hairline, en serif-telling rechts.
export default function CategoryHeader({ name, count }: CategoryHeaderProps) {
  return (
    <div className="category-header">
      <span className="category-header__icon" aria-hidden="true">
        <CategoryIcon name={name} size={18} />
      </span>
      <h2 className="category-header__name">{name}</h2>
      {typeof count === 'number' && (
        <span className="category-header__count">{count}</span>
      )}
    </div>
  )
}
