/// <reference types="vite/client" />

import type { AngduAPI } from '../../preload/index'

declare global {
  interface Window {
    api: AngduAPI
  }
}
