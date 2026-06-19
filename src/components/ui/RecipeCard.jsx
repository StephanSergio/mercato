// Het gegenereerde recept als mooi opgemaakt kaartje.
export default function RecipeCard({ recipe }) {
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
      <h2 className="recipe-card__title">{title}</h2>
      {description && <p className="recipe-card__desc">{description}</p>}

      <div className="recipe-card__pills">
        {servings != null && (
          <span className="recipe-pill">👥 {servings} pers.</span>
        )}
        {prepTime && <span className="recipe-pill">🔪 {prepTime}</span>}
        {cookTime && <span className="recipe-pill">🔥 {cookTime}</span>}
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
          <div className="recipe-tip__label">Tip van de kok</div>
          <div>{tip}</div>
        </div>
      )}
    </article>
  )
}
