import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mercato.userName'

// Bewaart "wie ben jij?" in localStorage. Geen login nodig.
export function useUserName() {
  const [userName, setUserNameState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''
    } catch {
      return ''
    }
  })

  const setUserName = (name: string) => {
    const trimmed = (name || '').trim()
    setUserNameState(trimmed)
    try {
      if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* localStorage niet beschikbaar (private mode) — negeer */
    }
  }

  // Sync tussen tabbladen.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUserNameState(e.newValue || '')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { userName, setUserName, hasName: Boolean(userName) }
}
