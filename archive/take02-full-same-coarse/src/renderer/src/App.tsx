import type { ThemeMode } from '@renderer/types'
import { theme as antdTheme, ConfigProvider } from 'antd'
import type { ErrorInfo, ReactNode } from 'react'
import { Component, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Router } from './Router'
import { persistor, store, useAppSelector } from './store'

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
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900">
          <div className="flex flex-col items-center gap-4 text-center px-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Error"
            >
              <title>Error</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Something went wrong</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              An unexpected error occurred. Please try reloading the application.
            </p>
            {this.state.error && (
              <pre className="mt-2 max-w-lg overflow-auto rounded bg-gray-100 dark:bg-gray-800 p-3 text-left text-xs text-gray-600 dark:text-gray-300">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useAppSelector((state) => state.settings.theme)
  const [systemDark, setSystemDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches)

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemDark)

  // Subscribe to IPC theme update events from main process (T060)
  useEffect(() => {
    if (typeof window.api?.onThemeUpdated !== 'function') return

    const unsubscribe = window.api.onThemeUpdated((resolvedTheme: ThemeMode) => {
      // When the main process detects a system theme change,
      // update local system dark state to trigger re-render
      setSystemDark(resolvedTheme === 'dark')
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Also listen to the browser's prefers-color-scheme media query
  // as a fallback for when the IPC channel is not available
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches)
    }
    mediaQuery.addEventListener('change', handler)
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  // Update document.documentElement className for Tailwind dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
      }}
    >
      <div className={isDark ? 'dark' : ''}>{children}</div>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeConfigProvider>
            <Router />
          </ThemeConfigProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  )
}
