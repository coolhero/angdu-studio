import { useSettingsStore, SettingsState } from '@renderer/stores/useSettingsStore'

export function useSettings<K extends keyof SettingsState>(key: K): SettingsState[K]
export function useSettings(): SettingsState
export function useSettings<K extends keyof SettingsState>(key?: K) {
  const store = useSettingsStore()
  if (key) return store[key]
  return store
}
