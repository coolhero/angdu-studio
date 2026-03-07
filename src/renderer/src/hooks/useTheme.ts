import { useEffect } from 'react'
import { useThemeStore } from '../stores/useThemeStore'

export function useTheme(): void {
  const { setTheme, setResolved } = useThemeStore()

  useEffect(() => {
    // Load initial theme
    window.api.theme.get().then((state: { mode: string; resolved: string }) => {
      useThemeStore.setState({
        mode: state.mode as 'light' | 'dark' | 'system',
        resolved: state.resolved as 'light' | 'dark'
      })
      applyThemeClass(state.resolved)
    })

    // Listen for theme changes from main process
    const unsubscribe = window.api.theme.onChanged(
      (state: { mode: string; resolved: string }) => {
        useThemeStore.setState({
          mode: state.mode as 'light' | 'dark' | 'system',
          resolved: state.resolved as 'light' | 'dark'
        })
        applyThemeClass(state.resolved)
      }
    )

    return unsubscribe
  }, [setTheme, setResolved])
}

function applyThemeClass(resolved: string): void {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}
