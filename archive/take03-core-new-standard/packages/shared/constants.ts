// Window dimensions
export const MIN_WINDOW_WIDTH = 1080
export const MIN_WINDOW_HEIGHT = 600
export const DEFAULT_WINDOW_WIDTH = 1280
export const DEFAULT_WINDOW_HEIGHT = 800

// Mini window dimensions
export const MINI_WINDOW_DEFAULT_WIDTH = 550
export const MINI_WINDOW_DEFAULT_HEIGHT = 400
export const MINI_WINDOW_MIN_WIDTH = 350
export const MINI_WINDOW_MIN_HEIGHT = 380
export const MINI_WINDOW_MAX_WIDTH = 1024
export const MINI_WINDOW_MAX_HEIGHT = 768

// Crash recovery
export const CRASH_RECOVERY_THRESHOLD_MS = 60_000

// File watching
export const FILE_WATCHER_DEBOUNCE_MS = 1000
export const FILE_WATCHER_STABILITY_THRESHOLD_MS = 500

// File upload progress threshold
export const FILE_PROGRESS_THRESHOLD_BYTES = 5 * 1024 * 1024 // 5MB

// Protocol
export const APP_PROTOCOL = 'cherry-studio'

// Config defaults
export const CONFIG_DEFAULTS = {
  language: '',
  theme: 'system' as const,
  zoomFactor: 1.0,
  launchToTray: false,
  tray: true,
  trayOnClose: false,
  enableQuickAssistant: false,
  clickTrayToShowQuickAssistant: false,
  disableHardwareAcceleration: false,
  useSystemTitleBar: false,
  proxy: null,
  shortcuts: [],
  enableDeveloperMode: false,
  autoUpdate: true,
  enableDataCollection: false,
  spellCheckEnabled: false,
  spellCheckLanguages: [],
  clientId: ''
}

// Logging
export const LOG_MAX_SIZE = '10m'
export const LOG_MAX_FILES_GENERAL = '30d'
export const LOG_MAX_FILES_ERROR = '60d'

// Supported locales
export const SUPPORTED_LOCALES = [
  'en-US',
  'ko-KR',
  'ja-JP',
  'ru-RU',
  'de-DE',
  'el-GR',
  'es-ES',
  'fr-FR',
  'pt-PT',
  'ro-RO'
] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
