import type { Shortcut, ThemeMode } from '../types'

export const APP_NAME = 'Cherry Studio'
export const DATA_DIR_NAME = 'cherry-studio'

export const DEFAULT_WINDOW_WIDTH = 1200
export const DEFAULT_WINDOW_HEIGHT = 800
export const MIN_WINDOW_WIDTH = 800
export const MIN_WINDOW_HEIGHT = 600

export const DEFAULT_THEME: ThemeMode = 'system'

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { key: 'show-hide-app', shortcut: ['CmdOrCtrl+Shift+Space'], enabled: true }
]
