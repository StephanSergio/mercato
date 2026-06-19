import {
  ShoppingCart,
  List,
  ChefHat,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import type { ScreenId } from '../types'

interface Tab {
  id: ScreenId
  icon: LucideIcon
  label: string
}

const TABS: Tab[] = [
  { id: 'list', icon: ShoppingCart, label: 'Lijst' },
  { id: 'browse', icon: List, label: 'Ingrediënten' },
  { id: 'recipe', icon: ChefHat, label: 'Recepten' },
  { id: 'admin', icon: SlidersHorizontal, label: 'Beheer' },
]

interface BottomNavProps {
  active: ScreenId
  onChange: (id: ScreenId) => void
  listCount?: number
}

// Onderste navigatiebalk (mobile-first). `listCount` toont een badge op de lijst.
export default function BottomNav({
  active,
  onChange,
  listCount = 0,
}: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__inner">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-btn${isActive ? ' nav-btn--active' : ''}`}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-btn__icon">
                <Icon size={22} strokeWidth={isActive ? 2 : 1.6} />
                {tab.id === 'list' && listCount > 0 && (
                  <span className="nav-btn__badge">{listCount}</span>
                )}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
