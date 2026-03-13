import Store from 'electron-store'
import type { AppConfig, ThemeMode, Language, ShortcutConfig } from '@shared/types'
import { DEFAULT_CONFIG } from '@shared/types'

type ConfigKey = keyof AppConfig
type ConfigCallback<K extends ConfigKey> = (newValue: AppConfig[K], oldValue: AppConfig[K]) => void

export class ConfigManager {
  private static instance: ConfigManager
  private store: Store<AppConfig>
  private subscribers = new Map<string, Set<ConfigCallback<any>>>()

  private constructor() {
    this.store = new Store<AppConfig>({
      name: 'angdu-studio-config',
      defaults: DEFAULT_CONFIG,
    })
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  get<K extends ConfigKey>(key: K): AppConfig[K] {
    return this.store.get(key) as AppConfig[K]
  }

  set<K extends ConfigKey>(key: K, value: AppConfig[K]): void {
    const oldValue = this.get(key)
    this.store.set(key, value)
    this.notify(key, value, oldValue)
  }

  setAndNotify<K extends ConfigKey>(key: K, value: AppConfig[K]): void {
    this.set(key, value)
  }

  subscribe<K extends ConfigKey>(key: K, callback: ConfigCallback<K>): () => void {
    const keyStr = key as string
    if (!this.subscribers.has(keyStr)) {
      this.subscribers.set(keyStr, new Set())
    }
    this.subscribers.get(keyStr)!.add(callback as ConfigCallback<any>)
    return () => {
      this.subscribers.get(keyStr)?.delete(callback as ConfigCallback<any>)
    }
  }

  private notify<K extends ConfigKey>(key: K, newValue: AppConfig[K], oldValue: AppConfig[K]): void {
    const keyStr = key as string
    const callbacks = this.subscribers.get(keyStr)
    if (callbacks) {
      for (const cb of callbacks) {
        cb(newValue, oldValue)
      }
    }
  }

  getTheme(): ThemeMode {
    return this.get('theme')
  }

  getLanguage(): Language {
    return this.get('language')
  }

  getShortcuts(): ShortcutConfig {
    return this.get('shortcuts')
  }

  isTrayEnabled(): boolean {
    return this.get('trayEnabled')
  }

  isTrayOnClose(): boolean {
    return this.get('trayOnClose')
  }

  isAutoUpdateEnabled(): boolean {
    return this.get('autoUpdate')
  }

  isLaunchToTray(): boolean {
    return this.get('launchToTray')
  }
}
