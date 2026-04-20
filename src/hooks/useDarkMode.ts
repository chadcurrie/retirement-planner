import { useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'

/*
  Thin wrapper around the Zustand dark flag.
  Syncs the .dark class on <html> whenever the store value changes.
  (The index.html pre-render script handles the initial load before React mounts.)
*/
export function useDarkMode() {
  const dark = usePlanStore((s) => s.display.dark)
  const setDark = usePlanStore((s) => s.setDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return { dark, toggle: () => setDark(!dark) }
}
