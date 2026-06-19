import { useState } from 'react'
import StoreBadges from './ui/StoreBadges'
import SaleBadge from './ui/SaleBadge'
import { isSaleExpired, formatShortDate } from '../lib/dates'
import { seedDatabase } from '../lib/seed'

const STORES = ['AH', 'Lidl', 'Deka']

const emptyForm = {
  name: '',
  category: '',
  store: [],
  unit: '',
  onSale: false,
  saleStore: 'AH',
  saleLabel: '',
  saleUntil: '',
}

// ---------- Ingrediënt-formulier (toevoegen / bewerken) ----------
function IngredientForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const toggleStore = (store) =>
    setForm((f) => ({
      ...f,
      store: f.store.includes(store)
        ? f.store.filter((s) => s !== store)
        : [...f.store, store],
    }))

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.category) return
    onSave({
      name: form.name.trim(),
      category: form.category,
      store: form.store,
      unit: form.unit.trim(),
      onSale: form.onSale,
      saleStore: form.onSale ? form.saleStore : '',
      saleLabel: form.onSale ? form.saleLabel.trim() : '',
      saleUntil: form.onSale ? form.saleUntil : '',
    })
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="field">
        <label className="field__label">Naam</label>
        <input
          className="field__input"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Bijv. Kipfilet"
          autoFocus
        />
      </div>

      <div className="field">
        <label className="field__label">Categorie</label>
        <select
          className="field__select"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
        >
          <option value="">— Kies categorie —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label">Verkrijgbaar bij</label>
        <div className="checkbox-group">
          {STORES.map((store) => (
            <button
              key={store}
              type="button"
              className="checkbox-chip"
              aria-pressed={form.store.includes(store)}
              onClick={() => toggleStore(store)}
            >
              {form.store.includes(store) ? '✓ ' : ''}
              {store}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field__label">Eenheid</label>
        <input
          className="field__input"
          value={form.unit}
          onChange={(e) => set('unit', e.target.value)}
          placeholder="Bijv. 500g, stuk, liter"
        />
      </div>

      <div className="toggle-row">
        <span className="field__label" style={{ marginBottom: 0 }}>
          In de aanbieding?
        </span>
        <button
          type="button"
          className="switch"
          role="switch"
          aria-checked={form.onSale}
          onClick={() => set('onSale', !form.onSale)}
        >
          <span className="switch__knob" />
        </button>
      </div>

      {form.onSale && (
        <>
          <div className="field">
            <label className="field__label">Aanbieding bij</label>
            <select
              className="field__select"
              value={form.saleStore}
              onChange={(e) => set('saleStore', e.target.value)}
            >
              {STORES.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label">Aanbiedingstekst</label>
            <input
              className="field__input"
              value={form.saleLabel}
              onChange={(e) => set('saleLabel', e.target.value)}
              placeholder='Bijv. "2 voor €5"'
            />
          </div>
          <div className="field">
            <label className="field__label">Geldig tot</label>
            <input
              type="date"
              className="field__input"
              value={form.saleUntil}
              onChange={(e) => set('saleUntil', e.target.value)}
            />
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary">
          Opslaan
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Annuleren
        </button>
      </div>
    </form>
  )
}

// ---------- Tab: Ingrediënten beheren ----------
function IngredientsTab({ ingredients, categories, actions }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  function handleSave(data) {
    if (editing) actions.updateIngredient(editing.id, data)
    else actions.addIngredient(data)
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div>
      {!showForm && (
        <button
          type="button"
          className="btn btn--primary btn--block"
          style={{ marginBottom: 16 }}
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
        >
          + Nieuw ingrediënt
        </button>
      )}

      {showForm && (
        <IngredientForm
          initial={editing}
          categories={categories}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      {ingredients.map((ing) => (
        <div key={ing.id} className="admin-row">
          <div className="admin-row__body">
            <div className="admin-row__name">{ing.name}</div>
            <div className="admin-row__meta">
              <span>{ing.category}</span>
              {ing.unit && <span>· {ing.unit}</span>}
              <StoreBadges stores={ing.store} />
              {ing.onSale && <SaleBadge ingredient={ing} />}
            </div>
          </div>
          <div className="admin-row__actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Bewerken"
              onClick={() => {
                setEditing({
                  ...emptyForm,
                  ...ing,
                  store: ing.store || [],
                  saleStore: ing.saleStore || 'AH',
                })
                setShowForm(true)
              }}
            >
              ✏️
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              aria-label="Verwijderen"
              onClick={() => {
                if (confirm(`"${ing.name}" verwijderen?`))
                  actions.removeIngredient(ing.id)
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- Tab: Aanbiedingen ----------
function SalesTab({ ingredients, actions }) {
  const sales = ingredients.filter((i) => i.onSale)

  if (sales.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__emoji">🏷️</span>
        <p>Geen aanbiedingen ingesteld.</p>
        <p className="muted">
          Zet een ingrediënt op aanbieding bij het tabblad Ingrediënten.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="section-intro">
        Snel aanbiedingen aan- of uitzetten. Verlopen aanbiedingen staan rood.
      </p>
      {sales.map((ing) => {
        const expired = isSaleExpired(ing.saleUntil)
        return (
          <div key={ing.id} className="admin-row">
            <div className="admin-row__body">
              <div className="admin-row__name">{ing.name}</div>
              <div className="admin-row__meta">
                <span>
                  {ing.saleStore} · {ing.saleLabel || 'Aanbieding'}
                </span>
                {ing.saleUntil && (
                  <span className={expired ? 'sale-expired-text' : ''}>
                    {expired ? 'Verlopen' : 'tot'}{' '}
                    {formatShortDate(ing.saleUntil)}
                  </span>
                )}
              </div>
            </div>
            <div className="admin-row__actions">
              <button
                type="button"
                className="switch"
                role="switch"
                aria-checked={ing.onSale}
                aria-label="Aanbieding aan/uit"
                onClick={() => actions.updateIngredient(ing.id, { onSale: false })}
              >
                <span className="switch__knob" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------- Tab: Categorieën beheren ----------
function CategoriesTab({ categories, actions }) {
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('')

  function addNew(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.order || 0), 0)
    actions.addCategory({
      name: newName.trim(),
      icon: newIcon.trim() || '📦',
      order: maxOrder + 1,
    })
    setNewName('')
    setNewIcon('')
  }

  // Wisselt de volgorde van twee categorieën om.
  function move(index, dir) {
    const target = index + dir
    if (target < 0 || target >= categories.length) return
    const a = categories[index]
    const b = categories[target]
    actions.updateCategory(a.id, { order: b.order })
    actions.updateCategory(b.id, { order: a.order })
  }

  return (
    <div>
      <form className="form-card" onSubmit={addNew}>
        <div className="field">
          <label className="field__label">Nieuwe categorie</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="field__input"
              style={{ width: 64, textAlign: 'center' }}
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="🥦"
              maxLength={2}
              aria-label="Emoji"
            />
            <input
              className="field__input"
              style={{ flex: 1 }}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Naam"
              aria-label="Categorienaam"
            />
          </div>
        </div>
        <button type="submit" className="btn btn--primary">
          + Toevoegen
        </button>
      </form>

      {categories.map((cat, i) => (
        <CategoryRow
          key={cat.id}
          cat={cat}
          isFirst={i === 0}
          isLast={i === categories.length - 1}
          onMove={(dir) => move(i, dir)}
          onSave={(data) => actions.updateCategory(cat.id, data)}
          onRemove={() => {
            if (confirm(`Categorie "${cat.name}" verwijderen?`))
              actions.removeCategory(cat.id)
          }}
        />
      ))}
    </div>
  )
}

function CategoryRow({ cat, isFirst, isLast, onMove, onSave, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cat.name)
  const [icon, setIcon] = useState(cat.icon)

  if (editing) {
    return (
      <div className="admin-row">
        <input
          className="field__input"
          style={{ width: 56, textAlign: 'center' }}
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={2}
        />
        <input
          className="field__input"
          style={{ flex: 1 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="admin-row__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Opslaan"
            onClick={() => {
              onSave({ name: name.trim() || cat.name, icon: icon.trim() || '📦' })
              setEditing(false)
            }}
          >
            ✓
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Annuleren"
            onClick={() => {
              setName(cat.name)
              setIcon(cat.icon)
              setEditing(false)
            }}
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-row">
      <div className="admin-row__body">
        <div className="admin-row__name">
          {cat.icon} {cat.name}
        </div>
      </div>
      <div className="admin-row__actions">
        <button
          type="button"
          className="icon-btn"
          aria-label="Omhoog"
          disabled={isFirst}
          onClick={() => onMove(-1)}
        >
          ↑
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Omlaag"
          disabled={isLast}
          onClick={() => onMove(1)}
        >
          ↓
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Bewerken"
          onClick={() => setEditing(true)}
        >
          ✏️
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          aria-label="Verwijderen"
          onClick={onRemove}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

// ---------- Hoofd AdminPanel ----------
export default function AdminPanel({
  ingredients,
  categories,
  ingredientActions,
  categoryActions,
}) {
  const [tab, setTab] = useState('ingredients')
  const [seedMsg, setSeedMsg] = useState('')
  const [seeding, setSeeding] = useState(false)

  const isEmpty = ingredients.length === 0 && categories.length === 0

  async function handleSeed() {
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await seedDatabase()
      setSeedMsg(res.message)
    } catch (e) {
      setSeedMsg('Vullen mislukt: ' + (e.message || e))
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div>
      {isEmpty && (
        <div className="banner banner--warn">
          <div className="banner__title">Database is leeg</div>
          <p style={{ marginBottom: 10 }}>
            Vul de database met standaard categorieën en een startset
            ingrediënten.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--small"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? 'Bezig…' : '🌱 Database vullen'}
          </button>
          {seedMsg && <p style={{ marginTop: 8 }}>{seedMsg}</p>}
        </div>
      )}

      <div className="tabs">
        <button
          type="button"
          className={`tab${tab === 'ingredients' ? ' tab--active' : ''}`}
          onClick={() => setTab('ingredients')}
        >
          Ingrediënten
        </button>
        <button
          type="button"
          className={`tab${tab === 'sales' ? ' tab--active' : ''}`}
          onClick={() => setTab('sales')}
        >
          Aanbiedingen
        </button>
        <button
          type="button"
          className={`tab${tab === 'categories' ? ' tab--active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Categorieën
        </button>
      </div>

      {tab === 'ingredients' && (
        <IngredientsTab
          ingredients={ingredients}
          categories={categories}
          actions={ingredientActions}
        />
      )}
      {tab === 'sales' && (
        <SalesTab ingredients={ingredients} actions={ingredientActions} />
      )}
      {tab === 'categories' && (
        <CategoriesTab categories={categories} actions={categoryActions} />
      )}
    </div>
  )
}
