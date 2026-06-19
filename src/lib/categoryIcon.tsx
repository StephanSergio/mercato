// ============================================================
// Mapt een categorienaam op een Lucide-icoon (geen emoji meer).
// Onbekende/nieuwe categorieën vallen terug op een neutraal icoon.
// ============================================================

import {
  Leaf,
  Beef,
  Milk,
  Croissant,
  Wheat,
  Soup,
  Sprout,
  Snowflake,
  CupSoda,
  Cookie,
  SprayCan,
  Package,
  type LucideIcon,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  'Groente & Fruit': Leaf,
  'Vlees & Vis': Beef,
  'Zuivel & Eieren': Milk,
  'Brood & Bakkerij': Croissant,
  'Pasta, Rijst & Granen': Wheat,
  'Blikken & Potten': Soup,
  'Sauzen & Kruiden': Sprout,
  Diepvries: Snowflake,
  Dranken: CupSoda,
  'Snacks & Tussendoor': Cookie,
  'Huishouden & Verzorging': SprayCan,
}

interface CategoryIconProps {
  name: string
  size?: number
}

export default function CategoryIcon({ name, size = 18 }: CategoryIconProps) {
  const Icon = MAP[name] || Package
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />
}
