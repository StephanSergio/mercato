import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db, COLLECTIONS } from '../firebase'
import type { AddToListInput, ShoppingItem } from '../types'

// Realtime hook voor de gezamenlijke winkellijst.
export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.shoppingList),
      (snap) => {
        setItems(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ShoppingItem)
        )
        setLoading(false)
      },
      (err) => {
        console.error('useShoppingList', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  // Voegt een ingrediënt toe (gedenormaliseerd voor snelheid).
  const addItem = (ingredient: AddToListInput, addedBy: string) =>
    addDoc(collection(db, COLLECTIONS.shoppingList), {
      ingredientId: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      checked: false,
      addedBy: addedBy || 'Onbekend',
      addedAt: serverTimestamp(),
    })

  const toggleChecked = (item: ShoppingItem) =>
    updateDoc(doc(db, COLLECTIONS.shoppingList, item.id), {
      checked: !item.checked,
    })

  const removeItem = (id: string) =>
    deleteDoc(doc(db, COLLECTIONS.shoppingList, id))

  // Verwijdert het lijst-item dat bij een ingrediënt hoort (toggle vanuit browser).
  const removeByIngredientId = async (ingredientId: string) => {
    const q = query(
      collection(db, COLLECTIONS.shoppingList),
      where('ingredientId', '==', ingredientId)
    )
    const snap = await getDocs(q)
    await Promise.all(
      snap.docs.map((d) => deleteDoc(doc(db, COLLECTIONS.shoppingList, d.id)))
    )
  }

  // Verwijdert alleen de aangevinkte items ("Lijst leegmaken").
  const clearChecked = async () => {
    const checked = items.filter((i) => i.checked)
    await Promise.all(checked.map((i) => removeItem(i.id)))
  }

  return {
    items,
    loading,
    addItem,
    toggleChecked,
    removeItem,
    removeByIngredientId,
    clearChecked,
  }
}
