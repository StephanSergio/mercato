// ============================================================
// Gedeelde domeintypes voor Mercato.
// ============================================================

import type { FieldValue, Timestamp } from 'firebase/firestore'

export type StoreName = 'AH' | 'Lidl' | 'Deka'

export type ScreenId = 'list' | 'browse' | 'recipe' | 'match' | 'admin'

// Weekdagen voor het menu (ma t/m zo). `key` wordt in Firestore opgeslagen.
export type WeekdayKey = 'ma' | 'di' | 'wo' | 'do' | 'vr' | 'za' | 'zo'

export interface Ingredient {
  id: string
  name: string
  category: string
  store: StoreName[]
  unit: string
  onSale: boolean
  saleStore: string
  saleLabel: string
  saleUntil: string
}

export interface Category {
  id: string
  name: string
  icon: string
  order: number
}

export interface ShoppingItem {
  id: string
  ingredientId: string
  name: string
  category: string
  // Aantal (bv. 3 appels). Default 1; ontbreekt op oude documenten.
  qty?: number
  checked: boolean
  addedBy: string
  // serverTimestamp() bij schrijven (FieldValue), Timestamp bij lezen.
  addedAt?: Timestamp | FieldValue | null
}

// Minimale vorm die nodig is om iets aan de lijst toe te voegen.
export type AddToListInput = Pick<Ingredient, 'id' | 'name' | 'category'>

export interface RecipeIngredient {
  amount: string
  name: string
}

export interface Recipe {
  title: string
  servings: number
  prepTime: string
  cookTime: string
  description: string
  ingredients: RecipeIngredient[]
  steps: string[]
  tip: string
}

// ── Match ("Tinder voor eten") ──────────────────────────────

// Eén gerecht-suggestie op een swipe-kaart. `id` is een stabiele slug
// van de titel, zodat stemmen van verschillende mensen op hetzelfde
// gerecht aan elkaar gekoppeld kunnen worden.
export interface DishIdea {
  id: string
  emoji: string
  title: string
  description: string
}

// Eén stem (ja/nee) van één persoon op één gerecht, voor één dag/week.
export interface DishVote {
  id: string
  weekId: string
  day: WeekdayKey
  dishId: string
  dishTitle: string
  dishDescription: string
  emoji: string
  voter: string
  vote: 'yes' | 'no'
  // serverTimestamp() bij schrijven (FieldValue), Timestamp bij lezen.
  votedAt?: Timestamp | FieldValue | null
}

// Een gerecht waar (minstens) twee mensen "ja" op zeiden: een match.
export interface DishMatch {
  dishId: string
  emoji: string
  title: string
  description: string
  voters: string[]
}

// Een vastgezet gerecht in het weekmenu (één per dag).
export interface MenuEntry {
  id: string // doc-id = `${weekId}_${day}`
  weekId: string
  day: WeekdayKey
  dishId: string
  emoji: string
  title: string
  description: string
  lockedBy: string
  lockedAt?: Timestamp | FieldValue | null
}

// CRUD-acties die de hooks teruggeven, doorgegeven aan AdminPanel.
export interface IngredientActions {
  addIngredient: (data: Omit<Ingredient, 'id'>) => Promise<unknown>
  updateIngredient: (
    id: string,
    data: Partial<Omit<Ingredient, 'id'>>
  ) => Promise<unknown>
  removeIngredient: (id: string) => Promise<unknown>
}

export interface CategoryActions {
  addCategory: (data: Omit<Category, 'id'>) => Promise<unknown>
  updateCategory: (
    id: string,
    data: Partial<Omit<Category, 'id'>>
  ) => Promise<unknown>
  removeCategory: (id: string) => Promise<unknown>
}
