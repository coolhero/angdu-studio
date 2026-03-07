export enum ConfigKeys {
  Language = 'language',
  Theme = 'theme',
  ZoomFactor = 'zoomFactor',
  LaunchToTray = 'launchToTray',
  Tray = 'tray',
  TrayOnClose = 'trayOnClose',
  Shortcuts = 'shortcuts',
  EnableQuickAssistant = 'enableQuickAssistant',
  ClickTrayToShowQuickAssistant = 'clickTrayToShowQuickAssistant',
  DisableHardwareAcceleration = 'disableHardwareAcceleration',
  UseSystemTitleBar = 'useSystemTitleBar',
  Proxy = 'proxy',
  EnableDeveloperMode = 'enableDeveloperMode',
  ClientId = 'clientId'
}

export type ThemeMode = 'light' | 'dark' | 'auto'

export type ProxyMode = 'system' | 'fixed_servers' | 'direct'

export interface ProxyConfig {
  mode: ProxyMode
  url?: string
  bypass?: string
}

export interface Shortcut {
  key: string
  shortcut: string[]
  enabled: boolean
}
