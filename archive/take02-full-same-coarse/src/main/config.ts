import { isDev } from '@main/constant'
import { app } from 'electron'

if (isDev) {
  app.setPath('userData', `${app.getPath('userData')}Dev`)
}

export const DATA_PATH = app.getPath('userData')

export const titleBarOverlayDark = {
  height: 42,
  color: '#1a1a1a',
  symbolColor: '#ffffff'
}

export const titleBarOverlayLight = {
  height: 42,
  color: '#ffffff',
  symbolColor: '#000000'
}
