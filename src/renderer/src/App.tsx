import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n'
import TitleBar from './components/TitleBar'
import NotificationCenter from './components/NotificationCenter'
import { useAppStore } from './stores/useAppStore'
import { useThemeStore } from './stores/useThemeStore'
import { useNotificationStore } from './stores/useNotificationStore'
import type { AppNotification } from '@shared/types'
import { IpcChannel } from '@shared/ipc-channels'

function App(): JSX.Element {
  const { hydrate, hydrated, appInfo } = useAppStore()
  const { setResolvedTheme } = useThemeStore()
  const { add: addNotification } = useNotificationStore()
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

  // Listen for resolved theme from main process
  useEffect(() => {
    // Initial theme: check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setResolvedTheme(prefersDark ? 'dark' : 'light')

    // Listen for theme updates from main
    const cleanup = window.api.onThemeUpdated((resolved) => {
      setResolvedTheme(resolved)
    })
    return cleanup
  }, [setResolvedTheme])

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-zinc-500">{t('app.loading')}</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
      <TitleBar />
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('app.name')}</h1>
          {appInfo && (
            <p className="mt-2 text-sm text-zinc-500">v{appInfo.version}</p>
          )}
        </div>
      </main>
      <NotificationCenter />
    </div>
  )
}

export default App
