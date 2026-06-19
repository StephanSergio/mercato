import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db, COLLECTIONS } from '../firebase'
import type { Ingredient } from '../types'

// Realtime hook voor alle ingrediënten, alfabetisch op naam.
export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.ingredients),
      orderBy('name', 'asc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setIngredients(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ingredient)
        )
        setLoading(false)
      },
      (err) => {
        console.error('useIngredients', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const addIngredient = (data: Omit<Ingredient, 'id'>) =>
    addDoc(collection(db, COLLECTIONS.ingredients), data)

  const updateIngredient = (
    id: string,
    data: Partial<Omit<Ingredient, 'id'>>
  ) => updateDoc(doc(db, COLLECTIONS.ingredients, id), data)

  const removeIngredient = (id: string) =>
    deleteDoc(doc(db, COLLECTIONS.ingredients, id))

  return {
    ingredients,
    loading,
    addIngredient,
    updateIngredient,
    removeIngredient,
  }
}
