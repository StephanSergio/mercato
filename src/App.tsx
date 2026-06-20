import { useMemo, useState } from 'react'
import { User } from 'lucide-react'
import BottomNav from './components/BottomNav'
import ShoppingList from './components/ShoppingList'
import IngredientBrowser from './components/IngredientBrowser'
import AdminPanel from './components/AdminPanel'
import RecipeGenerator from './components/RecipeGenerator'
import MatchSwiper from './components/MatchSwiper'
import NameModal from './components/NameModal'
import { useShoppingList } from './hooks/useShoppingList'
import { useIngredients } from './hooks/useIngredients'
import { useCategories } from './hooks/useCategories'
import { useUserName } from './hooks/useUserName'
import { isFirebaseConfigured } from './firebase'
import type { AddToListInput, Ingredient, ScreenId } from './types'

const SCREEN_TITLES: Record<ScreenId, { title: string; subtitle: string }> = {
  list: { title: 'Winkellijst', subtitle: 'Samen boodschappen doen' },
  browse: { title: 'Ingrediënten', subtitle: 'Tik aan om toe te voegen' },
  recipe: { title: 'Recepten', subtitle: 'Laat de kok iets voorstellen' },
  match: { title: 'Match', subtitle: 'Swipe samen het menu bij elkaar' },
  admin: { title: 'Beheer', subtitle: 'Producten, aanbiedingen, categorieën' },
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('list')
  const [showNameModal, setShowNameModal] = useState(false)

  const { userName, setUserName, hasName } = useUserName()
  const shopping = useShoppingList()
  const ingredientsHook = useIngredients()
  const categoriesHook = useCategories()

  // Set met ingredientId's die op de lijst staan (voor markering in Browser).
  const onListIds = useMemo(
    () => new Set(shopping.items.map((i) => i.ingredientId)),
    [shopping.items]
  )

  // Toggle vanuit de Browser: toevoegen of verwijderen.
  function toggleIngredient(ingredient: Ingredient) {
    if (!hasName) {
      setShowNameModal(true)
      return
    }
    if (onListIds.has(ingredient.id)) {
      shopping.removeByIngredientId(ingredient.id)
    } else {
      shopping.addItem(ingredient, userName)
    }
  }

  // Toevoegen vanuit het receptenscherm (ontbrekende ingrediënten).
  function addToList(ingredientLike: AddToListInput) {
    shopping.addItem(ingredientLike, userName || 'Recept')
  }

  const header = SCREEN_TITLES[screen]

  // Waarschuwing als Firebase nog niet is geconfigureerd.
  if (!isFirebaseConfigured) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-header__title">Mercato</h1>
        </header>
        <div className="banner banner--error">
          <div className="banner__title">Firebase niet geconfigureerd</div>
          <p>
            Vul je Firebase-config in via een <code>.env.local</code> bestand
            (zie <code>.env.example</code> en de README) en herstart de
            dev-server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-header__title">{header.title}</h1>
        <p className="app-header__subtitle">{header.subtitle}</p>
        <button
          type="button"
          className="app-header__name-pill"
          onClick={() => setShowNameModal(true)}
        >
          <User size={14} strokeWidth={1.75} />
          {hasName ? userName : 'Wie ben jij?'}
        </button>
      </header>

      <main>
        {screen === 'list' && (
          <ShoppingList
            items={shopping.items}
            categories={categoriesHook.categories}
            ingredients={ingredientsHook.ingredients}
            onToggle={shopping.toggleChecked}
            onSetQty={shopping.setQty}
            onRemove={shopping.removeItem}
            onClearChecked={shopping.clearChecked}
          />
        )}

        {screen === 'browse' && (
          <IngredientBrowser
            ingredients={ingredientsHook.ingredients}
            categories={categoriesHook.categories}
            onListIngredientIds={onListIds}
            onToggleIngredient={toggleIngredient}
          />
        )}

        {screen === 'recipe' && (
          <RecipeGenerator
            shoppingItems={shopping.items}
            ingredients={ingredientsHook.ingredients}
            onAddToList={addToList}
          />
        )}

        {screen === 'match' && (
          <MatchSwiper
            userName={userName}
            hasName={hasName}
            onNeedName={() => setShowNameModal(true)}
          />
        )}

        {screen === 'admin' && (
          <AdminPanel
            ingredients={ingredientsHook.ingredients}
            categories={categoriesHook.categories}
            ingredientActions={{
              addIngredient: ingredientsHook.addIngredient,
              updateIngredient: ingredientsHook.updateIngredient,
              removeIngredient: ingredientsHook.removeIngredient,
            }}
            categoryActions={{
              addCategory: categoriesHook.addCategory,
              updateCategory: categoriesHook.updateCategory,
              removeCategory: categoriesHook.removeCategory,
            }}
          />
        )}
      </main>

      <BottomNav
        active={screen}
        onChange={setScreen}
        listCount={shopping.items.filter((i) => !i.checked).length}
      />

      {showNameModal && (
        <NameModal
          current={userName}
          dismissible={hasName}
          onSave={(name) => {
            setUserName(name)
            setShowNameModal(false)
          }}
          onClose={() => setShowNameModal(false)}
        />
      )}
    </div>
  )
}
