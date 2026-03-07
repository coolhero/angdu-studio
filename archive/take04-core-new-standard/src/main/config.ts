import Store from 'electron-store'
import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import { ConfigKeys, type ProxyConfig, type Shortcut, type ThemeMode } from '@shared/types'

interface ConfigDefaults {
  [ConfigKeys.Language]: string
  [ConfigKeys.Theme]: ThemeMode
  [ConfigKeys.ZoomFactor]: number
  [ConfigKeys.LaunchToTray]: boolean
  [ConfigKeys.Tray]: boolean
  [ConfigKeys.TrayOnClose]: boolean
  [ConfigKeys.Shortcuts]: Shortcut[]
  [ConfigKeys.EnableQuickAssistant]: boolean
  [ConfigKeys.ClickTrayToShowQuickAssistant]: boolean
  [ConfigKeys.DisableHardwareAcceleration]: boolean
  [ConfigKeys.UseSystemTitleBar]: boolean
  [ConfigKeys.Proxy]: ProxyConfig
  [ConfigKeys.EnableDeveloperMode]: boolean
  [ConfigKeys.ClientId]: string
}

const defaults: ConfigDefaults = {
  [ConfigKeys.Language]: 'en-US',
  [ConfigKeys.Theme]: 'auto',
  [ConfigKeys.ZoomFactor]: 1.0,
  [ConfigKeys.LaunchToTray]: false,
  [ConfigKeys.Tray]: true,
  [ConfigKeys.TrayOnClose]: false,
  [ConfigKeys.Shortcuts]: [],
  [ConfigKeys.EnableQuickAssistant]: true,
  [ConfigKeys.ClickTrayToShowQuickAssistant]: false,
  [ConfigKeys.DisableHardwareAcceleration]: false,
  [ConfigKeys.UseSystemTitleBar]: false,
  [ConfigKeys.Proxy]: { mode: 'system' },
  [ConfigKeys.EnableDeveloperMode]: false,
  [ConfigKeys.ClientId]: uuidv4()
}

class ConfigManager extends EventEmitter {
  private store: Store<ConfigDefaults>

  constructor() {
    super()
    this.store = new Store<ConfigDefaults>({ defaults })
  }

  get<T>(key: ConfigKeys): T {
    return this.store.get(key) as T
  }

  set<T>(key: ConfigKeys, value: T): void {
    this.store.set(key, value)
    this.emit(`change:${key}`, value)
    this.emit('change', key, value)
  }

  subscribe(key: ConfigKeys, listener: (value: unknown) => void): () => void {
    const handler = (v: unknown) => listener(v)
    this.on(`change:${key}`, handler)
    return () => this.off(`change:${key}`, handler)
  }

  getAll(): ConfigDefaults {
    return this.store.store
  }

  reset(key: ConfigKeys): void {
    const defaultValue = defaults[key]
    if (defaultValue !== undefined) {
      this.set(key, defaultValue)
    }
  }
}

export const configManager = new ConfigManager()
