import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, COLLECTIONS } from '../firebase'
import { isoWeekId } from '../lib/dates'
import type {
  DishIdea,
  DishMatch,
  DishVote,
  MenuEntry,
  WeekdayKey,
} from '../types'

// Realtime hook voor "Tinder voor eten": stemmen + het weekmenu.
// Alles is gescoped op de huidige ISO-week (nieuwe week = schone lei).
export function useMatch(userName: string) {
  const weekId = isoWeekId()
  const [votes, setVotes] = useState<DishVote[]>([])
  const [menu, setMenu] = useState<MenuEntry[]>([])

  // Stemmen van deze week live volgen.
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.dishVotes),
      (snap) => {
        const all = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as DishVote
        )
        setVotes(all.filter((v) => v.weekId === weekId))
      },
      (err) => console.error('useMatch.votes', err)
    )
    return unsub
  }, [weekId])

  // Het vastgezette weekmenu live volgen.
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.weekMenu),
      (snap) => {
        const all = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as MenuEntry
        )
        setMenu(all.filter((m) => m.weekId === weekId))
      },
      (err) => console.error('useMatch.menu', err)
    )
    return unsub
  }, [weekId])

  // Brengt een stem uit (of overschrijft een eerdere stem op hetzelfde gerecht).
  const castVote = async (
    dish: DishIdea,
    day: WeekdayKey,
    vote: 'yes' | 'no'
  ) => {
    const voter = userName || 'Onbekend'
    // Eerdere stem van deze persoon op dit gerecht/dag verwijderen (idempotent).
    const prior = votes.filter(
      (v) =>
        v.day === day && v.dishId === dish.id && v.voter === voter
    )
    await Promise.all(
      prior.map((v) => deleteDoc(doc(db, COLLECTIONS.dishVotes, v.id)))
    )
    await addDoc(collection(db, COLLECTIONS.dishVotes), {
      weekId,
      day,
      dishId: dish.id,
      dishTitle: dish.title,
      dishDescription: dish.description,
      emoji: dish.emoji,
      voter,
      vote,
      votedAt: serverTimestamp(),
    })
  }

  // Dish-id's waar de huidige persoon al op gestemd heeft (per dag).
  const votedDishIdsFor = (day: WeekdayKey): Set<string> => {
    const voter = userName || 'Onbekend'
    return new Set(
      votes
        .filter((v) => v.day === day && v.voter === voter)
        .map((v) => v.dishId)
    )
  }

  // Matches voor een dag: gerechten met ≥2 verschillende "ja"-stemmers.
  const matchesForDay = (day: WeekdayKey): DishMatch[] => {
    const byDish = new Map<string, DishMatch & { _voters: Set<string> }>()
    for (const v of votes) {
      if (v.day !== day || v.vote !== 'yes') continue
      const cur =
        byDish.get(v.dishId) ??
        ({
          dishId: v.dishId,
          emoji: v.emoji,
          title: v.dishTitle,
          description: v.dishDescription,
          voters: [],
          _voters: new Set<string>(),
        } as DishMatch & { _voters: Set<string> })
      cur._voters.add(v.voter)
      byDish.set(v.dishId, cur)
    }
    return [...byDish.values()]
      .filter((m) => m._voters.size >= 2)
      .map(({ _voters, ...m }) => ({ ...m, voters: [..._voters] }))
  }

  // Het weekmenu als lookup per dag.
  const menuByDay = useMemo(() => {
    const map = new Map<WeekdayKey, MenuEntry>()
    for (const m of menu) map.set(m.day, m)
    return map
  }, [menu])

  // Zet een (gematcht) gerecht vast op een dag in het menu.
  const lockToMenu = (match: DishMatch, day: WeekdayKey) =>
    setDoc(doc(db, COLLECTIONS.weekMenu, `${weekId}_${day}`), {
      weekId,
      day,
      dishId: match.dishId,
      emoji: match.emoji,
      title: match.title,
      description: match.description,
      lockedBy: userName || 'Onbekend',
      lockedAt: serverTimestamp(),
    })

  // Maakt een dag in het menu weer leeg.
  const clearMenu = (day: WeekdayKey) =>
    deleteDoc(doc(db, COLLECTIONS.weekMenu, `${weekId}_${day}`))

  return {
    weekId,
    votes,
    castVote,
    votedDishIdsFor,
    matchesForDay,
    menuByDay,
    lockToMenu,
    clearMenu,
  }
}
