import { Clock, Users, Lightbulb } from 'lucide-react'
import type { Recipe } from '../../types'

interface RecipeCardProps {
  recipe: Recipe | null
}

// Het gegenereerde recept als mooi opgemaakt kaartje.
export default function RecipeCard({ recipe }: RecipeCardProps) {
  if (!recipe) return null

  const {
    title,
    servings,
    prepTime,
    cookTime,
    description,
    ingredients = [],
    steps = [],
    tip,
  } = recipe

  return (
    <article className="recipe-card">
      <div className="recipe-card__kicker">Voorstel van Mercato</div>
      <h2 className="recipe-card__title">{title}</h2>
      {description && <p className="recipe-card__desc">{description}</p>}

      <div className="recipe-card__pills">
        {prepTime && (
          <span className="recipe-pill">
            <Clock size={14} strokeWidth={1.75} /> {prepTime}
          </span>
        )}
        {cookTime && (
          <span className="recipe-pill">
            <Clock size={14} strokeWidth={1.75} /> {cookTime}
          </span>
        )}
        {servings != null && (
          <span className="recipe-pill">
            <Users size={14} strokeWidth={1.75} /> {servings} personen
          </span>
        )}
      </div>

      {ingredients.length > 0 && (
        <>
          <h3 className="recipe-card__section-title">Ingrediënten</h3>
          <ul className="recipe-card__ingredients">
            {ingredients.map((ing, i) => (
              <li key={i}>
                <span className="recipe-card__amount">{ing.amount}</span>
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {steps.length > 0 && (
        <>
          <h3 className="recipe-card__section-title">Bereiding</h3>
          <ol className="recipe-card__steps">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </>
      )}

      {tip && (
        <div className="recipe-tip">
          <div className="recipe-tip__label">
            <Lightbulb size={13} strokeWidth={1.75} /> Tip van de kok
          </div>
          <div>{tip}</div>
        </div>
      )}
    </article>
  )
}
