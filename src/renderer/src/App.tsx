import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster } from 'sonner'
import './i18n'
import TitleBar from './components/TitleBar'
import NotificationCenter from './components/NotificationCenter'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ConfirmDialogProvider } from './components/ConfirmDialogProvider'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings/SettingsPage'
import FilesPage from './pages/files/FilesPage'
import MinAppsPage from './pages/minapps/MinAppsPage'
import MinAppPage from './pages/minapps/MinAppPage'
import { useAppStore } from './stores/useAppStore'
import { useThemeStore } from './stores/useThemeStore'
import { useNotificationStore } from './stores/useNotificationStore'
import { useRuntimeStore } from './stores/useRuntimeStore'
import { useSettingsStore } from './stores/useSettingsStore'
import type { AppNotification } from '@shared/types'
import { IpcChannel } from '@shared/ipc-channels'

function App(): JSX.Element {
  const { hydrate, hydrated, appInfo } = useAppStore()
  const { setResolvedTheme } = useThemeStore()
  const { add: addNotification } = useNotificationStore()
  const activePage = useRuntimeStore((s) => s.activePage)
  const activeMinAppId = useRuntimeStore((s) => s.activeMinAppId)
  const { t } = useTranslation()

  useEffect(() => {
    hydrate()

    // Listen for theme updates from main process
    const cleanupStoreSync = window.api.storeSync.onUpdate((patch) => {
      if (patch.key === 'theme') {
        // Theme mode changed — resolved theme comes via Theme_Updated
      }
    })

    // Subscribe to store sync
    window.api.storeSync.subscribe()

    return () => {
      cleanupStoreSync()
      window.api.storeSync.unsubscribe()
    }
  }, [])

  // Listen for resolved theme from main process (nativeTheme changes)
  useEffect(() => {
    const cleanup = window.api.onThemeUpdated((resolved) => {
      // Only apply if user selected 'auto' mode
      const currentMode = useSettingsStore.getState().themeMode
      if (currentMode === 'auto') {
        setResolvedTheme(resolved)
      }
    })
    return cleanup
  }, [setResolvedTheme])

  // ── Apply display settings to DOM ──
  const themeMode = useSettingsStore((s) => s.themeMode)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const fontFamily = useSettingsStore((s) => s.fontFamily)
  const codeFontFamily = useSettingsStore((s) => s.codeFontFamily)
  const primaryColor = useSettingsStore((s) => s.primaryColor)

  // Apply theme mode
  useEffect(() => {
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setResolvedTheme(prefersDark ? 'dark' : 'light')
      const listener = (e: MediaQueryListEvent) => setResolvedTheme(e.matches ? 'dark' : 'light')
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    } else {
      setResolvedTheme(themeMode === 'dark' ? 'dark' : 'light')
    }
  }, [themeMode, setResolvedTheme])

  // Apply font size, font family, code font, primary color as CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--app-font-size', `${fontSize}px`)
    root.style.setProperty('--app-font-family', fontFamily)
    root.style.setProperty('--app-code-font-family', codeFontFamily)
    root.style.setProperty('--app-primary-color', primaryColor)
    // Also apply directly for immediate effect
    document.body.style.fontSize = `${fontSize}px`
    document.body.style.fontFamily = fontFamily
  }, [fontSize, fontFamily, codeFontFamily, primaryColor])

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-zinc-500">{t('app.loading')}</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ConfirmDialogProvider>
        <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
          <TitleBar />
          <main className="flex flex-1 overflow-hidden">
            {activePage === 'chat' && <HomePage />}
            {activePage === 'settings' && <SettingsPage />}
            {activePage === 'files' && <FilesPage />}
            {activePage === 'minapps' && (
              <MinAppsPage
                onNavigate={(appId) => {
                  useRuntimeStore.getState().setActiveMinApp(appId)
                  useRuntimeStore.getState().setActivePage('minapp')
                }}
              />
            )}
            {activePage === 'minapp' && activeMinAppId && (
              <MinAppPage
                appId={activeMinAppId}
                onBack={() => useRuntimeStore.getState().setActivePage('minapps')}
              />
            )}
          </main>
          <NotificationCenter />
          <Toaster richColors position="bottom-right" />
        </div>
      </ConfirmDialogProvider>
    </ErrorBoundary>
  )
}

export default App
