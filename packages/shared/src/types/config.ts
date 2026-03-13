export type ThemeMode = 'dark' | 'light' | 'system'
export type Language = 'ko' | 'en'
export type ProxyMode = 'system' | 'custom' | 'direct'
export type UpdateChannel = 'latest' | 'rc' | 'beta'

export interface ShortcutConfig {
  showApp: string
  miniWindow: string
  selectionAssistant: string
}

export interface ProxyConfig {
  mode: ProxyMode
  url?: string
  bypassRules?: string
}

export interface AppConfig {
  theme: ThemeMode
  language: Language
  trayEnabled: boolean
  trayOnClose: boolean
  clickTrayToShowQuickAssistant: boolean
  launchOnBoot: boolean
  launchToTray: boolean
  autoUpdate: boolean
  updateChannel: UpdateChannel
  proxyMode: ProxyMode
  proxyUrl: string
  proxyBypassRules: string
  shortcuts: ShortcutConfig
  zoomFactor: number
  spellCheckEnabled: boolean
  spellCheckLanguages: string[]
  hardwareAcceleration: boolean
}

export interface AppInfo {
  version: string
  arch: string
  platform: string
  dataPath: string
  isPackaged: boolean
}

export const DEFAULT_CONFIG: AppConfig = {
  theme: 'dark',
  language: 'ko',
  trayEnabled: true,
  trayOnClose: false,
  clickTrayToShowQuickAssistant: false,
  launchOnBoot: false,
  launchToTray: false,
  autoUpdate: true,
  updateChannel: 'latest',
  proxyMode: 'system',
  proxyUrl: '',
  proxyBypassRules: '',
  shortcuts: {
    showApp: 'Alt+Shift+Space',
    miniWindow: 'Alt+Space',
    selectionAssistant: 'Ctrl+Shift+A',
  },
  zoomFactor: 1.0,
  spellCheckEnabled: false,
  spellCheckLanguages: ['en-US'],
  hardwareAcceleration: true,
}
