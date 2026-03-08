import type { ShortcutBinding } from './types'

export const MIN_WINDOW_WIDTH = 1080
export const MIN_WINDOW_HEIGHT = 600

export const MINI_WINDOW_WIDTH = 550
export const MINI_WINDOW_HEIGHT = 400

export const ANGDU_STUDIO_PROTOCOL = 'angdu-studio'

export const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  {
    key: 'zoom-in',
    name: 'shortcuts.zoomIn',
    accelerator: 'CommandOrControl+=',
    globalShortcut: false,
    system: true,
    enabled: true
  },
  {
    key: 'zoom-out',
    name: 'shortcuts.zoomOut',
    accelerator: 'CommandOrControl+-',
    globalShortcut: false,
    system: true,
    enabled: true
  },
  {
    key: 'zoom-reset',
    name: 'shortcuts.zoomReset',
    accelerator: 'CommandOrControl+0',
    globalShortcut: false,
    system: true,
    enabled: true
  }
]
