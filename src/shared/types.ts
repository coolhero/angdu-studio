export enum ThemeMode {
  Dark = 'dark',
  Light = 'light',
  System = 'system'
}

export type ProxyMode = 'system' | 'custom' | 'none'

export interface ProxyConfig {
  mode: ProxyMode
  url?: string
  bypassRules?: string[]
}

export interface AppInfo {
  version: string
  name: string
  platform: NodeJS.Platform
  arch: string
  electronVersion: string
  chromeVersion: string
  nodeVersion: string
  dataPath: string
  isPackaged: boolean
  locale: string
}

export interface PlatformInfo {
  platform: NodeJS.Platform
  arch: string
  isMac: boolean
  isWindows: boolean
  isLinux: boolean
  osVersion: string
}

export interface AppNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  source: string
  progress?: number
  actions?: NotificationAction[]
  dismissAfterMs?: number
  createdAt: number
}

export interface NotificationAction {
  label: string
  action: string
}

export interface ShortcutBinding {
  key: string
  name: string
  accelerator: string
  globalShortcut: boolean
  system: boolean
  enabled: boolean
}

export type UpdateChannel = 'latest' | 'rc' | 'beta'

export interface UpdateCheckResult {
  version: string
  releaseDate: string
  releaseNotes?: string
}

export interface RelaunchOptions {
  args?: string[]
  execPath?: string
}
