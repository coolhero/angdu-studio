import type { AppInfo } from '@shared/types'
import { initI18n } from './i18n'
import { store } from './store'
import { setAppInfo } from './store/runtime'

export async function initializeApp(): Promise<void> {
  // Initialize i18n with the persisted language from settings store
  const state = store.getState()
  const language = state.settings?.language || 'en-US'
  await initI18n(language)

  // Fetch app info from main process
  const appInfo: AppInfo = await window.api.getInfo()
  store.dispatch(setAppInfo(appInfo))
}
