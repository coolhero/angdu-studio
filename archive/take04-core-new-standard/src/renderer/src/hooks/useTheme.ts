import { useEffect } from 'react'
import { useAppStore } from '../stores/useAppStore'

export function useTheme() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  useEffect(() => {
    const applyTheme = (resolved: string) => {
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    }

    // Map store theme to main process theme mode
    const mode = theme === 'auto' ? 'system' : theme
    window.api?.app?.setTheme(mode)

    // Apply initial theme based on current setting
    if (theme === 'auto') {
      window.api?.system?.isDarkMode().then((isDark: boolean) => {
        applyTheme(isDark ? 'dark' : 'light')
      })
    } else {
      applyTheme(theme)
    }

    // Listen for theme changes from main process (OS theme change, other window)
    const cleanup = window.api?.app?.onThemeUpdated((data: { theme: string }) => {
      applyTheme(data.theme)
    })

    return () => cleanup?.()
  }, [theme])

  return { theme, setTheme }
}
