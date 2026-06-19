// ============================================================
// Gedeelde domeintypes voor Mercato.
// ============================================================

import type { FieldValue, Timestamp } from 'firebase/firestore'

export type StoreName = 'AH' | 'Lidl' | 'Deka'

export type ScreenId = 'list' | 'browse' | 'recipe' | 'admin'

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
