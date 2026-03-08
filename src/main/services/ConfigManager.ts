import Store from 'electron-store'
import { app } from 'electron'
import { v4 as uuidv4 } from 'crypto'
import { ThemeMode } from '@shared/types'
import type { ShortcutBinding, UpdateChannel, ProxyMode } from '@shared/types'
import { DEFAULT_SHORTCUTS } from '@shared/constants'

export enum ConfigKeys {
  ClientId = 'clientId',
  Theme = 'theme',
  ZoomFactor = 'zoomFactor',
  Language = 'language',
  ProxyMode = 'proxyMode',
  ProxyUrl = 'proxyUrl',
  ProxyBypassRules = 'proxyBypassRules',
  Tray = 'tray',
  TrayOnClose = 'trayOnClose',
  LaunchToTray = 'launchToTray',
  AutoUpdate = 'autoUpdate',
  UpdateChannel = 'updateChannel',
  Shortcuts = 'shortcuts',
  EnableQuickAssistant = 'enableQuickAssistant',
  ClickTrayToShowQuickAssistant = 'clickTrayToShowQuickAssistant',
  DisableHardwareAcceleration = 'disableHardwareAcceleration',
  UseSystemTitleBar = 'useSystemTitleBar',
  EnableDeveloperMode = 'enableDeveloperMode'
}

interface AppConfigSchema {
  clientId: string
  theme: ThemeMode
  zoomFactor: number
  language: string
  proxyMode: ProxyMode
  proxyUrl: string
  proxyBypassRules: string
  tray: boolean
  trayOnClose: boolean
  launchToTray: boolean
  autoUpdate: boolean
  updateChannel: UpdateChannel
  shortcuts: ShortcutBinding[]
  enableQuickAssistant: boolean
  clickTrayToShowQuickAssistant: boolean
  disableHardwareAcceleration: boolean
  useSystemTitleBar: boolean
  enableDeveloperMode: boolean
}

const defaults: AppConfigSchema = {
  clientId: '',
  theme: ThemeMode.System,
  zoomFactor: 1.0,
  language: 'ko',
  proxyMode: 'system',
  proxyUrl: '',
  proxyBypassRules: '',
  tray: true,
  trayOnClose: true,
  launchToTray: false,
  autoUpdate: true,
  updateChannel: 'latest',
  shortcuts: DEFAULT_SHORTCUTS,
  enableQuickAssistant: false,
  clickTrayToShowQuickAssistant: false,
  disableHardwareAcceleration: false,
  useSystemTitleBar: false,
  enableDeveloperMode: false
}

class ConfigManager {
  private store: Store<AppConfigSchema>
  private subscribers: Map<string, Array<(newValue: unknown) => void>> = new Map()

  constructor() {
    try {
      this.store = new Store<AppConfigSchema>({ defaults })
    } catch {
      // Config corruption — reset to defaults
      this.store = new Store<AppConfigSchema>({ defaults, clearInvalidConfig: true })
    }

    // Generate clientId on first launch
    if (!this.store.get(ConfigKeys.ClientId)) {
      this.store.set(ConfigKeys.ClientId, crypto.randomUUID())
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.store.get(key, defaultValue) as T
  }

  set(key: string, value: unknown, notify = false): void {
    this.store.set(key, value)
    if (notify) {
      this.notifySubscribers(key, value)
    }
  }

  subscribe(key: string, callback: (newValue: unknown) => void): void {
    const callbacks = this.subscribers.get(key) ?? []
    callbacks.push(callback)
    this.subscribers.set(key, callbacks)
  }

  unsubscribe(key: string, callback: (newValue: unknown) => void): void {
    const callbacks = this.subscribers.get(key)
    if (callbacks) {
      this.subscribers.set(
        key,
        callbacks.filter((cb) => cb !== callback)
      )
    }
  }

  private notifySubscribers(key: string, newValue: unknown): void {
    const callbacks = this.subscribers.get(key)
    if (callbacks) {
      for (const cb of callbacks) {
        cb(newValue)
      }
    }
  }

  // Convenience getters
  getTheme(): ThemeMode {
    return this.get<ThemeMode>(ConfigKeys.Theme, ThemeMode.System)
  }

  getLanguage(): string {
    return this.get<string>(ConfigKeys.Language, 'ko')
  }

  getZoomFactor(): number {
    return this.get<number>(ConfigKeys.ZoomFactor, 1.0)
  }

  getDisableHardwareAcceleration(): boolean {
    return this.get<boolean>(ConfigKeys.DisableHardwareAcceleration, false)
  }

  getTray(): boolean {
    return this.get<boolean>(ConfigKeys.Tray, true)
  }

  getTrayOnClose(): boolean {
    return this.get<boolean>(ConfigKeys.TrayOnClose, true)
  }

  getProxyMode(): ProxyMode {
    return this.get<ProxyMode>(ConfigKeys.ProxyMode, 'system')
  }

  getShortcuts(): ShortcutBinding[] {
    return this.get<ShortcutBinding[]>(ConfigKeys.Shortcuts, DEFAULT_SHORTCUTS)
  }

  getUpdateChannel(): UpdateChannel {
    return this.get<UpdateChannel>(ConfigKeys.UpdateChannel, 'latest')
  }
}

export const configManager = new ConfigManager()
