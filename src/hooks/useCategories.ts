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
import type { Category } from '../types'

// Realtime hook voor categorieën, altijd gesorteerd op `order`.
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.categories),
      orderBy('order', 'asc')
    )
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCategories(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)
        )
        setLoading(false)
      },
      (err) => {
        console.error('useCategories', err)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const addCategory = (data: Omit<Category, 'id'>) =>
    addDoc(collection(db, COLLECTIONS.categories), data)

  const updateCategory = (id: string, data: Partial<Omit<Category, 'id'>>) =>
    updateDoc(doc(db, COLLECTIONS.categories, id), data)

  const removeCategory = (id: string) =>
    deleteDoc(doc(db, COLLECTIONS.categories, id))

  return { categories, loading, addCategory, updateCategory, removeCategory }
}
