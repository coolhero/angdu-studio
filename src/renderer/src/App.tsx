import React, { Component, useCallback, useEffect, useState, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

declare global {
  interface Window {
    api: import('@shared/types/preload').PreloadAPI
  }
}

// ─── Error Boundary ─────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm opacity-70">{this.state.error?.message}</p>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Theme Hook ─────────────────────────────────────────────────

type ThemeMode = 'dark' | 'light' | 'system'

function applyDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
  document.body.classList.toggle('dark', isDark)
}

function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('dark')

  useEffect(() => {
    // Apply initial dark mode
    applyDarkClass(true)

    // Listen for theme changes from main process
    const unsub = window.api.on('theme-changed', (data: unknown) => {
      const { theme: newTheme, shouldUseDarkColors } = data as { theme: ThemeMode; shouldUseDarkColors: boolean }
      setThemeState(newTheme)
      applyDarkClass(shouldUseDarkColors)
    })
    return unsub
  }, [])

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    window.api.setTheme(newTheme)

    // Immediately apply for responsiveness
    if (newTheme === 'dark') {
      applyDarkClass(true)
    } else if (newTheme === 'light') {
      applyDarkClass(false)
    }
    // 'system' will be resolved by the main process and sent back via theme-changed event
  }, [])

  return { theme, setTheme }
}

// ─── Titlebar ───────────────────────────────────────────────────

function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const { theme, setTheme } = useTheme()
  const isMac = navigator.userAgent.includes('Mac')

  useEffect(() => {
    // Listen for maximize state changes
    const unsub = window.api.on('window:maximized-changed', (maximized: unknown) => {
      setIsMaximized(maximized as boolean)
    })

    // Initial check
    window.api.windowControls.isMaximized().then(setIsMaximized)

    return unsub
  }, [])

  const cycleTheme = useCallback(() => {
    const order: ThemeMode[] = ['dark', 'light', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }, [theme, setTheme])

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'
  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'

  return (
    <div
      className="drag-region flex items-center h-[var(--navbar-height)] bg-[var(--bg-primary)] border-b border-black/10 dark:border-white/10 select-none"
      style={{ paddingLeft: isMac ? 78 : 12, paddingRight: 4 }}
    >
      {/* App title */}
      <span className="text-xs font-medium opacity-60 mr-auto">Angdu Studio</span>

      {/* Theme toggle */}
      <button
        className="no-drag flex items-center gap-1 px-2 py-1 rounded text-xs opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-opacity"
        onClick={cycleTheme}
        title={`Theme: ${themeLabel}`}
      >
        <span>{themeIcon}</span>
        <span>{themeLabel}</span>
      </button>

      {/* Window controls (Windows/Linux only) */}
      {!isMac && (
        <div className="no-drag flex items-center ml-2">
          <button
            className="w-[46px] h-[var(--navbar-height)] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={() => window.api.windowControls.minimize()}
            title="Minimize"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
              <rect width="10" height="1" />
            </svg>
          </button>
          <button
            className="w-[46px] h-[var(--navbar-height)] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={() => window.api.windowControls.maximize()}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="0" width="8" height="8" rx="0.5" />
                <rect x="0" y="2" width="8" height="8" rx="0.5" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="0.5" y="0.5" width="9" height="9" rx="0.5" />
              </svg>
            )}
          </button>
          <button
            className="w-[46px] h-[var(--navbar-height)] flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            onClick={() => window.api.windowControls.close()}
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
              <line x1="1" y1="1" x2="9" y2="9" />
              <line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main App ───────────────────────────────────────────────────

function App() {
  const { t } = useTranslation()

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        <Titlebar />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar placeholder */}
          <div className="w-[var(--sidebar-width)] bg-black/5 dark:bg-white/5 flex flex-col items-center py-2 gap-1 border-r border-black/10 dark:border-white/10">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">
              A
            </div>
          </div>
          {/* Main content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">{t('app.name')}</h1>
              <p className="opacity-50 text-sm">AI Desktop Application</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
