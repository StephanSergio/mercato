import { useState } from 'react'

const PRESETS = ['Susanne', 'Stephan', 'Miles', 'Julian']

interface NameModalProps {
  current: string
  onSave: (name: string) => void
  onClose: () => void
  dismissible: boolean
}

// "Wie ben jij?" — naam instellen, opgeslagen in localStorage.
export default function NameModal({
  current,
  onSave,
  onClose,
  dismissible,
}: NameModalProps) {
  const [value, setValue] = useState(current || '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    onSave(value)
  }

  return (
    <div className="modal-overlay" onClick={dismissible ? onClose : undefined}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h2 className="modal__title">Wie ben jij?</h2>
        <p className="modal__sub">
          Je naam komt bij elk item dat je toevoegt. Je kunt dit altijd
          aanpassen.
        </p>

        <div className="modal__presets">
          {PRESETS.map((name) => (
            <button
              key={name}
              type="button"
              className="checkbox-chip"
              aria-pressed={value === name}
              onClick={() => setValue(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="field">
          <input
            className="field__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Of typ je eigen naam…"
            autoFocus
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary btn--block">
            Opslaan
          </button>
        </div>
        {dismissible && (
          <button
            type="button"
            className="btn btn--ghost btn--block"
            style={{ marginTop: 8 }}
            onClick={onClose}
          >
            Sluiten
          </button>
        )}
      </form>
    </div>
  )
}
