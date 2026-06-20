// ============================================================
// Firebase initialisatie + exports
// ------------------------------------------------------------
// Config wordt uit Vite-omgevingsvariabelen gelezen (VITE_FIREBASE_*).
// Vul deze in een .env.local bestand (lokaal) en als GitHub Actions
// secrets (deploy). Zie .env.example en README.md.
// ============================================================

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Handig waarschuwingssignaal als de config nog niet is ingevuld.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
)

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Collectie-namen op één plek, zodat hooks ze delen.
export const COLLECTIONS = {
  ingredients: 'ingredients',
  shoppingList: 'shoppingList',
  categories: 'categories',
  // "Tinder voor eten": losse ja/nee-stemmen en het vastgezette weekmenu.
  dishVotes: 'dishVotes',
  weekMenu: 'weekMenu',
} as const
