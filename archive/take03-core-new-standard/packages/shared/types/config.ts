import type { ProxyConfig } from './app'

export enum ConfigKey {
  Language = 'language',
  Theme = 'theme',
  ZoomFactor = 'zoomFactor',
  LaunchToTray = 'launchToTray',
  Tray = 'tray',
  TrayOnClose = 'trayOnClose',
  EnableQuickAssistant = 'enableQuickAssistant',
  ClickTrayToShowQuickAssistant = 'clickTrayToShowQuickAssistant',
  DisableHardwareAcceleration = 'disableHardwareAcceleration',
  UseSystemTitleBar = 'useSystemTitleBar',
  Proxy = 'proxy',
  Shortcuts = 'shortcuts',
  EnableDeveloperMode = 'enableDeveloperMode',
  AutoUpdate = 'autoUpdate',
  EnableDataCollection = 'enableDataCollection',
  SpellCheckEnabled = 'spellCheckEnabled',
  SpellCheckLanguages = 'spellCheckLanguages',
  ClientId = 'clientId'
}

export interface Shortcut {
  key: string
  shortcut: string[]
  enabled: boolean
}

export interface ConfigValues {
  [ConfigKey.Language]: string
  [ConfigKey.Theme]: 'light' | 'dark' | 'system'
  [ConfigKey.ZoomFactor]: number
  [ConfigKey.LaunchToTray]: boolean
  [ConfigKey.Tray]: boolean
  [ConfigKey.TrayOnClose]: boolean
  [ConfigKey.EnableQuickAssistant]: boolean
  [ConfigKey.ClickTrayToShowQuickAssistant]: boolean
  [ConfigKey.DisableHardwareAcceleration]: boolean
  [ConfigKey.UseSystemTitleBar]: boolean
  [ConfigKey.Proxy]: ProxyConfig | null
  [ConfigKey.Shortcuts]: Shortcut[]
  [ConfigKey.EnableDeveloperMode]: boolean
  [ConfigKey.AutoUpdate]: boolean
  [ConfigKey.EnableDataCollection]: boolean
  [ConfigKey.SpellCheckEnabled]: boolean
  [ConfigKey.SpellCheckLanguages]: string[]
  [ConfigKey.ClientId]: string
}
