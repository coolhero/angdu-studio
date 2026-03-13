import { app } from 'electron'
import { join } from 'path'
import { isMac } from './constant'

export const DATA_PATH = app.getPath('userData')

export function getDataDir(): string {
  return DATA_PATH
}

export function getFilesDir(): string {
  return join(DATA_PATH, 'files')
}

export function getTitleBarOverlayConfig(isDarkTheme: boolean) {
  if (!isMac) return undefined
  return {
    color: isDarkTheme ? '#1e1e2e' : '#ffffff',
    symbolColor: isDarkTheme ? '#cdd6f4' : '#1e1e2e',
    height: 36,
  }
}
