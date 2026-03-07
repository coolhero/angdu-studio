import { useEffect } from 'react'
import { useThemeStore } from '../stores/theme'
import type { ThemeMode } from '@shared/types'

export function useTheme() {
  const { mode, isDark, setMode, setIsDark } = useThemeStore()

  // Apply dark class to document
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // Listen for theme changes from main process
  useEffect(() => {
    const cleanup = window.api.app.onThemeChanged((newMode: ThemeMode) => {
      setMode(newMode)
    })
    return cleanup
  }, [setMode])

  // Detect system dark mode via media query
  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setIsDark(mode === 'dark')
    }
  }, [mode, setIsDark])

  const toggleTheme = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark'
    setMode(next)
    window.api.app.setTheme(next)
  }

  return { mode, isDark, setMode, toggleTheme }
}
