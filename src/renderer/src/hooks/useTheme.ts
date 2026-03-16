import { useEffect } from 'react'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import type { Theme } from '@shared/types/config'

function applyThemeClass(isDark: boolean): void {
  const html = document.documentElement
  html.classList.remove('light', 'dark')
  html.classList.add(isDark ? 'dark' : 'light')

  // Also sync body class for existing code that uses body.dark
  document.body.classList.remove('light', 'dark')
  document.body.classList.add(isDark ? 'dark' : 'light')
}

function resolveSystemTheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme(): void {
  const theme = useSettingsStore((s) => s.theme)
  const fontSize = useSettingsStore((s) => s.fontSize)

  // Apply theme class based on theme value
  useEffect(() => {
    if (theme === 'system') {
      applyThemeClass(resolveSystemTheme())
    } else {
      applyThemeClass(theme === 'dark')
    }
  }, [theme])

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      applyThemeClass(e.matches)
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Listen for theme:changed IPC events from main process
  useEffect(() => {
    const unsub = window.api.events.on('theme:changed', (resolved) => {
      applyThemeClass(resolved === 'dark')
    })
    return unsub
  }, [])

  // Apply font size to body
  useEffect(() => {
    document.body.style.fontSize = `${fontSize}px`
  }, [fontSize])
}

export function setThemeIPC(theme: Theme): void {
  // theme:set accepts 'light' | 'dark' | 'system'
  window.api.invoke['theme:set'](theme)
}
