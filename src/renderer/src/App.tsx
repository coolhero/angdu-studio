import { Component, useEffect, type ReactNode } from 'react'
import { useUIStore, initUIStoreListeners } from './stores/useUIStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { useShortcutsStore } from './stores/useShortcutsStore'
import { useQuickPhrasesStore } from './stores/useQuickPhrasesStore'
import { useTheme } from './hooks/useTheme'
import { AppRouter } from './Router'

// Error Boundary — catches render errors, shows fallback UI (F7-01, Pattern Constraint)
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-foreground">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
          <button
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  // Apply theme class to <html> and <body>, sync font size (F003)
  useTheme()

  // Initialize IPC event listeners (in useEffect, NOT render — Pattern Constraint)
  useEffect(() => {
    const cleanup = initUIStoreListeners()

    // Load initial theme from main process
    window.api.invoke['theme:get']().then((resolved) => {
      useUIStore.getState().setTheme(resolved)
    })

    // Hydrate F003 stores
    useSettingsStore.getState().hydrate()
    useShortcutsStore.getState().hydrate()
    useQuickPhrasesStore.getState().hydrate()

    return cleanup
  }, [])

  return <AppRouter />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}
