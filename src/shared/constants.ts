import type { ThemeMode } from './types/theme'
import type { ProxyMode } from './types/config'
import type { WindowState } from './types/window'

export const APP_NAME = 'Angdu Studio'
export const APP_ID = 'com.angdu.studio'

export const DEFAULT_WINDOW_STATE: WindowState = {
  width: 1200,
  height: 800,
  isMaximized: false
}

export const DEFAULT_CONFIG = {
  theme: 'system' as ThemeMode,
  language: '',
  launchOnBoot: false,
  proxyMode: 'system' as ProxyMode,
  proxyUrl: '',
  shortcuts: [],
  windowState: DEFAULT_WINDOW_STATE,
  dataPath: '',
  logLevel: 'info',
  logShowModules: ''
} as const

export const CRASH_RECOVERY_THRESHOLD_MS = 60_000
export const IPC_TIMEOUT_MS = 100
export const THEME_SWITCH_TIMEOUT_MS = 200
export const APP_LAUNCH_TIMEOUT_MS = 3_000
