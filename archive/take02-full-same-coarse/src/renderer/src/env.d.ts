/// <reference types="vite/client" />

import type { WindowApiType } from '../../preload/index'

declare global {
  interface Window {
    api: WindowApiType
    electron: typeof import('@electron-toolkit/preload').electronAPI
  }
}
