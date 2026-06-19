// ============================================================
// Seed-data + seed-functie voor Firestore.
// Wordt aangeroepen vanuit het Beheer-scherm ("Database vullen").
// Schrijft alleen als de collecties leeg zijn, om dubbels te voorkomen.
// ============================================================

import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { db, COLLECTIONS } from '../firebase'
import type { Category, Ingredient } from '../types'

// `icon` blijft leeg: het categorie-icoon wordt afgeleid van de naam
// via src/lib/categoryIcon.tsx (Lucide), niet meer uit opgeslagen emoji.
export const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Groente & Fruit', icon: '', order: 1 },
  { name: 'Vlees & Vis', icon: '', order: 2 },
  { name: 'Zuivel & Eieren', icon: '', order: 3 },
  { name: 'Brood & Bakkerij', icon: '', order: 4 },
  { name: 'Pasta, Rijst & Granen', icon: '', order: 5 },
  { name: 'Blikken & Potten', icon: '', order: 6 },
  { name: 'Sauzen & Kruiden', icon: '', order: 7 },
  { name: 'Diepvries', icon: '', order: 8 },
  { name: 'Dranken', icon: '', order: 9 },
  { name: 'Snacks & Tussendoor', icon: '', order: 10 },
  { name: 'Huishouden & Verzorging', icon: '', order: 11 },
]

// Korte helper om saledatums leesbaar te houden in de seed.
const sale = (saleStore: string, saleLabel: string, saleUntil: string) => ({
  onSale: true,
  saleStore,
  saleLabel,
  saleUntil,
})
const noSale = { onSale: false, saleStore: '', saleLabel: '', saleUntil: '' }

export const defaultIngredients: Omit<Ingredient, 'id'>[] = [
  // --- Groente & Fruit ---
  { name: 'Banaan', category: 'Groente & Fruit', store: ['AH', 'Lidl'], unit: 'stuk', ...noSale },
  { name: 'Tomaten', category: 'Groente & Fruit', store: ['AH', 'Lidl', 'Deka'], unit: '500g', ...sale('Lidl', '2 voor €2', '2026-06-22') },
  { name: 'Komkommer', category: 'Groente & Fruit', store: ['AH', 'Deka'], unit: 'stuk', ...noSale },
  { name: 'Avocado', category: 'Groente & Fruit', store: ['AH'], unit: 'stuk', ...sale('AH', '3 voor €2,50', '2026-06-21') },
  { name: 'Ui', category: 'Groente & Fruit', store: ['AH', 'Lidl', 'Deka'], unit: 'kg', ...noSale },
  { name: 'Knoflook', category: 'Groente & Fruit', store: ['AH', 'Lidl'], unit: 'stuk', ...noSale },
  { name: 'Paprika rood', category: 'Groente & Fruit', store: ['Lidl', 'Deka'], unit: 'stuk', ...noSale },
  { name: 'Appels (Elstar)', category: 'Groente & Fruit', store: ['AH', 'Lidl'], unit: 'kg', ...noSale },
  { name: 'Spinazie', category: 'Groente & Fruit', store: ['AH', 'Deka'], unit: '300g', ...noSale },
  { name: 'Wortels', category: 'Groente & Fruit', store: ['AH', 'Lidl', 'Deka'], unit: '500g', ...noSale },

  // --- Vlees & Vis ---
  { name: 'Kipfilet', category: 'Vlees & Vis', store: ['AH', 'Lidl', 'Deka'], unit: '500g', ...sale('AH', '2 voor €5', '2026-06-22') },
  { name: 'Gehakt (half om half)', category: 'Vlees & Vis', store: ['AH', 'Lidl'], unit: '500g', ...noSale },
  { name: 'Zalmfilet', category: 'Vlees & Vis', store: ['AH', 'Deka'], unit: '2 stuks', ...noSale },
  { name: 'Spekreepjes', category: 'Vlees & Vis', store: ['AH', 'Lidl'], unit: '200g', ...noSale },
  { name: 'Kipgehakt', category: 'Vlees & Vis', store: ['AH'], unit: '400g', ...noSale },

  // --- Zuivel & Eieren ---
  { name: 'Halfvolle melk', category: 'Zuivel & Eieren', store: ['AH', 'Lidl', 'Deka'], unit: 'liter', ...noSale },
  { name: 'Eieren (vrije uitloop)', category: 'Zuivel & Eieren', store: ['AH', 'Lidl', 'Deka'], unit: '10 stuks', ...sale('Deka', '€1,99', '2026-06-20') },
  { name: 'Jonge kaas plakken', category: 'Zuivel & Eieren', store: ['AH', 'Deka'], unit: '200g', ...noSale },
  { name: 'Roomboter', category: 'Zuivel & Eieren', store: ['AH', 'Lidl'], unit: '250g', ...noSale },
  { name: 'Griekse yoghurt', category: 'Zuivel & Eieren', store: ['AH', 'Lidl', 'Deka'], unit: '500g', ...noSale },

  // --- Brood & Bakkerij ---
  { name: 'Volkorenbrood', category: 'Brood & Bakkerij', store: ['AH', 'Lidl', 'Deka'], unit: 'heel', ...noSale },
  { name: 'Croissants', category: 'Brood & Bakkerij', store: ['AH', 'Lidl'], unit: '4 stuks', ...noSale },
  { name: 'Wraps', category: 'Brood & Bakkerij', store: ['AH', 'Deka'], unit: '8 stuks', ...noSale },

  // --- Pasta, Rijst & Granen ---
  { name: 'Spaghetti', category: 'Pasta, Rijst & Granen', store: ['AH', 'Lidl', 'Deka'], unit: '500g', ...noSale },
  { name: 'Basmati rijst', category: 'Pasta, Rijst & Granen', store: ['AH', 'Lidl'], unit: '1kg', ...sale('Lidl', '€1,49', '2026-06-25') },
  { name: 'Penne', category: 'Pasta, Rijst & Granen', store: ['AH', 'Deka'], unit: '500g', ...noSale },
  { name: 'Havermout', category: 'Pasta, Rijst & Granen', store: ['AH', 'Lidl'], unit: '500g', ...noSale },

  // --- Blikken & Potten ---
  { name: 'Tomatenblokjes', category: 'Blikken & Potten', store: ['AH', 'Lidl', 'Deka'], unit: '400g', ...noSale },
  { name: 'Kikkererwten', category: 'Blikken & Potten', store: ['AH', 'Lidl'], unit: '400g', ...noSale },
  { name: 'Kokosmelk', category: 'Blikken & Potten', store: ['AH', 'Deka'], unit: '400ml', ...noSale },
  { name: 'Pindakaas', category: 'Blikken & Potten', store: ['AH', 'Lidl', 'Deka'], unit: '350g', ...noSale },

  // --- Sauzen & Kruiden ---
  { name: 'Olijfolie', category: 'Sauzen & Kruiden', store: ['AH', 'Lidl', 'Deka'], unit: '500ml', ...noSale },
  { name: 'Sojasaus', category: 'Sauzen & Kruiden', store: ['AH', 'Deka'], unit: '150ml', ...noSale },
  { name: 'Pesto groen', category: 'Sauzen & Kruiden', store: ['AH', 'Lidl'], unit: '190g', ...noSale },
  { name: 'Sambal', category: 'Sauzen & Kruiden', store: ['AH', 'Deka'], unit: '95g', ...noSale },

  // --- Diepvries ---
  { name: 'Diepvries doperwten', category: 'Diepvries', store: ['AH', 'Lidl'], unit: '750g', ...noSale },
  { name: 'Pizza margherita', category: 'Diepvries', store: ['AH', 'Lidl', 'Deka'], unit: 'stuk', ...sale('Deka', '2 voor €4', '2026-06-19') },
  { name: 'Frikandellen', category: 'Diepvries', store: ['Lidl', 'Deka'], unit: '10 stuks', ...noSale },

  // --- Dranken ---
  { name: 'Sinaasappelsap', category: 'Dranken', store: ['AH', 'Lidl', 'Deka'], unit: 'liter', ...noSale },
  { name: 'Cola', category: 'Dranken', store: ['AH', 'Lidl', 'Deka'], unit: '1,5L', ...noSale },
  { name: 'Bruisend water', category: 'Dranken', store: ['AH', 'Lidl'], unit: '1,5L', ...noSale },
  { name: 'Koffiebonen', category: 'Dranken', store: ['AH', 'Deka'], unit: '500g', ...noSale },

  // --- Snacks & Tussendoor ---
  { name: 'Pure chocolade', category: 'Snacks & Tussendoor', store: ['AH', 'Lidl'], unit: '100g', ...noSale },
  { name: 'Chips naturel', category: 'Snacks & Tussendoor', store: ['AH', 'Lidl', 'Deka'], unit: '200g', ...noSale },
  { name: 'Ongezouten noten', category: 'Snacks & Tussendoor', store: ['AH', 'Deka'], unit: '200g', ...noSale },

  // --- Huishouden & Verzorging ---
  { name: 'Vaatwastabletten', category: 'Huishouden & Verzorging', store: ['AH', 'Lidl', 'Deka'], unit: '40 stuks', ...noSale },
  { name: 'Toiletpapier', category: 'Huishouden & Verzorging', store: ['AH', 'Lidl', 'Deka'], unit: '8 rollen', ...noSale },
  { name: 'Tandpasta', category: 'Huishouden & Verzorging', store: ['AH', 'Deka'], unit: '75ml', ...noSale },
  { name: 'Afwasmiddel', category: 'Huishouden & Verzorging', store: ['AH', 'Lidl'], unit: '500ml', ...noSale },
]

export interface SeedResult {
  seeded: boolean
  message: string
}

// Vult de database. Retourneert een statusbericht.
export async function seedDatabase(): Promise<SeedResult> {
  const catSnap = await getDocs(collection(db, COLLECTIONS.categories))
  const ingSnap = await getDocs(collection(db, COLLECTIONS.ingredients))

  if (!catSnap.empty && !ingSnap.empty) {
    return {
      seeded: false,
      message: 'Database bevat al gegevens — niets gedaan.',
    }
  }

  const batch = writeBatch(db)

  if (catSnap.empty) {
    defaultCategories.forEach((cat) => {
      batch.set(doc(collection(db, COLLECTIONS.categories)), cat)
    })
  }
  if (ingSnap.empty) {
    defaultIngredients.forEach((ing) => {
      batch.set(doc(collection(db, COLLECTIONS.ingredients)), ing)
    })
  }

  await batch.commit()
  return {
    seeded: true,
    message: `Toegevoegd: ${
      catSnap.empty ? defaultCategories.length : 0
    } categorieën, ${ingSnap.empty ? defaultIngredients.length : 0} ingrediënten.`,
  }
}
