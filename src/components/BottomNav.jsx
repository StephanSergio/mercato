const TABS = [
  { id: 'list', icon: '🛒', label: 'Lijst' },
  { id: 'browse', icon: '📋', label: 'Ingrediënten' },
  { id: 'recipe', icon: '👨‍🍳', label: 'Recepten' },
  { id: 'admin', icon: '⚙️', label: 'Beheer' },
]

// Onderste navigatiebalk (mobile-first). `listCount` toont een badge op de lijst.
export default function BottomNav({ active, onChange, listCount = 0 }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__inner">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-btn${active === tab.id ? ' nav-btn--active' : ''}`}
            onClick={() => onChange(tab.id)}
            aria-current={active === tab.id ? 'page' : undefined}
          >
            <span className="nav-btn__icon" aria-hidden="true">
              {tab.icon}
              {tab.id === 'list' && listCount > 0 && (
                <span className="nav-btn__badge">{listCount}</span>
              )}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
