import { useMemo, useRef, useState } from 'react'
import {
  Heart,
  X,
  Sparkles,
  RefreshCw,
  CalendarCheck,
  Lock,
  Trash2,
  ShoppingBasket,
  Check,
} from 'lucide-react'
import { useMatch } from '../hooks/useMatch'
import { WEEKDAYS, weekdayKeyOf } from '../lib/dates'
import {
  defaultDeck,
  dishIngredientsById,
  generateDishIdeas,
  isDishAiEnabled,
} from '../lib/dishes'
import { consolidate } from '../lib/pantry'
import type { ConsolidatedItem, DishIdea, WeekdayKey } from '../types'

interface MatchSwiperProps {
  userName: string
  hasName: boolean
  onNeedName: () => void
  onAddToList: (items: ConsolidatedItem[], addedBy: string) => void
}

// Afstand (px) waarop een sleep telt als ja/nee.
const SWIPE_THRESHOLD = 90

export default function MatchSwiper({
  userName,
  hasName,
  onNeedName,
  onAddToList,
}: MatchSwiperProps) {
  const match = useMatch(userName)
  const [day, setDay] = useState<WeekdayKey>(() => weekdayKeyOf())
  const [deck, setDeck] = useState<DishIdea[]>(() => defaultDeck())
  const [loadingAi, setLoadingAi] = useState(false)
  const [aiError, setAiError] = useState('')
  // Lokaal "al beoordeeld" (key = `dag:dishId`) zodat de kaart direct
  // doorschuift, ook vóór de server-bevestiging terugkomt.
  const [seen, setSeen] = useState<Record<string, true>>({})
  // Welke bronnen al op de lijst zijn gezet (voor "toegevoegd"-feedback).
  const [added, setAdded] = useState<Record<string, true>>({})

  // Sleep-status van de bovenste kaart.
  const [drag, setDrag] = useState({ dx: 0, active: false })
  const startX = useRef(0)

  const serverVoted = match.votedDishIdsFor(day)
  const queue = useMemo(
    () =>
      deck.filter((d) => !seen[`${day}:${d.id}`] && !serverVoted.has(d.id)),
    // serverVoted volgt uit match.votes; deck/seen/day expliciet.
    [deck, day, seen, match.votes] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const top = queue[0]
  const matches = match.matchesForDay(day)

  async function refreshFromAi() {
    setLoadingAi(true)
    setAiError('')
    try {
      const ideas = await generateDishIdeas(12)
      setDeck(ideas)
      setSeen({})
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Er ging iets mis.')
    } finally {
      setLoadingAi(false)
    }
  }

  function vote(dish: DishIdea, choice: 'yes' | 'no') {
    if (!hasName) {
      onNeedName()
      return
    }
    // Direct doorschuiven (optimistisch); stem schrijven voor de match.
    setSeen((s) => ({ ...s, [`${day}:${dish.id}`]: true }))
    setDrag({ dx: 0, active: false })
    void match.castVote(dish, day, choice)
  }

  // Eén gematcht gerecht → boodschappen op de lijst.
  function addDishToList(dishId: string, title: string) {
    const items = consolidate(dishIngredientsById(dishId))
    if (!items.length) return
    onAddToList(items, title)
    setAdded((a) => ({ ...a, [dishId]: true }))
  }

  // Het hele (vastgezette) weekmenu → samengevoegde boodschappen op de lijst.
  function addWeekToList() {
    const all = [...match.menuByDay.values()].flatMap((m) =>
      dishIngredientsById(m.dishId)
    )
    const items = consolidate(all)
    if (!items.length) return
    onAddToList(items, 'Weekmenu')
    setAdded((a) => ({ ...a, week: true }))
  }

  // ── Sleep-interactie (pointer) ──
  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    setDrag({ dx: 0, active: true })
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.active) return
    setDrag({ dx: e.clientX - startX.current, active: true })
  }
  function onPointerUp() {
    if (!drag.active || !top) return
    if (drag.dx > SWIPE_THRESHOLD) vote(top, 'yes')
    else if (drag.dx < -SWIPE_THRESHOLD) vote(top, 'no')
    else setDrag({ dx: 0, active: false })
  }

  const dayLabel = WEEKDAYS.find((w) => w.key === day)?.long ?? ''
  const rotation = Math.max(-12, Math.min(12, drag.dx / 8))
  const verdict = drag.dx > 40 ? 'yes' : drag.dx < -40 ? 'no' : null
  const menuCount = match.menuByDay.size

  return (
    <div>
      <p className="section-intro">
        Swipe samen door de gerechten. Zegt iedereen <strong>ja</strong> tegen
        hetzelfde gerecht? Dan is het een match voor {dayLabel.toLowerCase()}.
      </p>

      {/* Dagkiezer */}
      <div className="day-picker" role="tablist" aria-label="Kies een dag">
        {WEEKDAYS.map((w) => (
          <button
            key={w.key}
            type="button"
            role="tab"
            aria-selected={w.key === day}
            className={`day-chip${w.key === day ? ' day-chip--active' : ''}${
              match.menuByDay.has(w.key) ? ' day-chip--locked' : ''
            }`}
            onClick={() => setDay(w.key)}
          >
            {w.short}
            {match.menuByDay.has(w.key) && (
              <Lock size={10} strokeWidth={2.25} />
            )}
          </button>
        ))}
      </div>

      {/* Swipe-deck */}
      <div className="swipe-deck">
        {top ? (
          <div
            className="dish-card"
            style={{
              transform: `translateX(${drag.dx}px) rotate(${rotation}deg)`,
              transition: drag.active ? 'none' : 'transform 0.25s ease',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {verdict && (
              <span
                className={`dish-card__stamp dish-card__stamp--${verdict}`}
              >
                {verdict === 'yes' ? 'JA' : 'NEE'}
              </span>
            )}
            <span className="dish-card__emoji">{top.emoji}</span>
            <h2 className="dish-card__title">{top.title}</h2>
            <p className="dish-card__desc">{top.description}</p>
            <span className="dish-card__count">Nog {queue.length} te gaan</span>
          </div>
        ) : (
          <div className="dish-card dish-card--empty">
            <span className="dish-card__emoji">🍽️</span>
            <p className="muted">
              Je hebt alles beoordeeld voor {dayLabel.toLowerCase()}.
            </p>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => {
                setDeck(defaultDeck())
                setSeen({})
              }}
            >
              <RefreshCw size={14} strokeWidth={1.75} /> Opnieuw
            </button>
          </div>
        )}
      </div>

      {/* Ja / nee */}
      {top && (
        <div className="swipe-actions">
          <button
            type="button"
            className="swipe-btn swipe-btn--no"
            onClick={() => vote(top, 'no')}
            aria-label="Nee"
          >
            <X size={26} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            className="swipe-btn swipe-btn--yes"
            onClick={() => vote(top, 'yes')}
            aria-label="Ja"
          >
            <Heart size={24} strokeWidth={2.25} />
          </button>
        </div>
      )}

      {/* AI-suggesties (optioneel) */}
      {isDishAiEnabled && (
        <div className="match-ai">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={refreshFromAi}
            disabled={loadingAi}
          >
            {loadingAi ? (
              <>
                <span className="spinner spinner--dark" /> Even denken…
              </>
            ) : (
              <>
                <Sparkles size={14} strokeWidth={1.75} /> Nieuwe suggesties van
                de kok
              </>
            )}
          </button>
          {aiError && <p className="match-ai__error">{aiError}</p>}
        </div>
      )}

      {/* Matches voor de gekozen dag */}
      <section className="match-section">
        <h3 className="match-section__title">
          Matches · {dayLabel}
          {matches.length > 0 && (
            <span className="match-section__badge">{matches.length}</span>
          )}
        </h3>
        {matches.length === 0 ? (
          <p className="muted match-section__empty">
            Nog geen match. Zodra twee personen hetzelfde gerecht leuk vinden,
            verschijnt het hier.
          </p>
        ) : (
          matches.map((m) => {
            const locked = match.menuByDay.get(day)?.dishId === m.dishId
            const hasIngredients = dishIngredientsById(m.dishId).length > 0
            return (
              <div key={m.dishId} className="match-row">
                <span className="match-row__emoji">{m.emoji}</span>
                <div className="match-row__body">
                  <div className="match-row__title">{m.title}</div>
                  <div className="match-row__voters">
                    {m.voters.join(' & ')} vinden dit lekker
                  </div>
                </div>
                <div className="match-row__actions">
                  {hasIngredients && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => addDishToList(m.dishId, m.title)}
                      aria-label="Ingrediënten op de lijst"
                      title="Ingrediënten op de boodschappenlijst"
                    >
                      {added[m.dishId] ? (
                        <Check size={15} strokeWidth={2.25} />
                      ) : (
                        <ShoppingBasket size={15} strokeWidth={1.75} />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    className={`btn btn--small ${
                      locked ? 'btn--ghost' : 'btn--sage'
                    }`}
                    onClick={() => match.lockToMenu(m, day)}
                    disabled={locked}
                  >
                    {locked ? (
                      <>
                        <Lock size={13} strokeWidth={2} /> Op menu
                      </>
                    ) : (
                      <>
                        <CalendarCheck size={13} strokeWidth={2} /> Op menu
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </section>

      {/* Weekmenu */}
      <section className="match-section">
        <h3 className="match-section__title">Weekmenu</h3>
        <div className="week-menu">
          {WEEKDAYS.map((w) => {
            const entry = match.menuByDay.get(w.key)
            return (
              <div
                key={w.key}
                className={`week-menu__row${
                  entry ? ' week-menu__row--filled' : ''
                }`}
              >
                <span className="week-menu__day">{w.short}</span>
                {entry ? (
                  <>
                    <span className="week-menu__emoji">{entry.emoji}</span>
                    <span className="week-menu__dish">{entry.title}</span>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger week-menu__clear"
                      onClick={() => match.clearMenu(w.key)}
                      aria-label={`${w.long} leegmaken`}
                    >
                      <Trash2 size={15} strokeWidth={1.75} />
                    </button>
                  </>
                ) : (
                  <span className="week-menu__dish muted">— nog leeg —</span>
                )}
              </div>
            )
          })}
        </div>

        {menuCount > 0 && (
          <button
            type="button"
            className="btn btn--primary btn--block"
            style={{ marginTop: 'var(--sp-3)' }}
            onClick={addWeekToList}
          >
            {added.week ? (
              <>
                <Check size={16} strokeWidth={2.25} /> Toegevoegd aan de lijst
              </>
            ) : (
              <>
                <ShoppingBasket size={16} strokeWidth={1.75} /> Boodschappen voor
                de week ({menuCount})
              </>
            )}
          </button>
        )}
        {menuCount > 0 && (
          <p className="match-section__hint">
            We voegen samen — twee keer 500 ml melk wordt één pak van 1 l.
          </p>
        )}
      </section>
    </div>
  )
}
