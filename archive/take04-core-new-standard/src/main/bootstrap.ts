import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const isPortable =
  process.platform === 'win32' &&
  existsSync(join(process.execPath, '..', 'portable'))

const isAppImage =
  process.platform === 'linux' && !!process.env.APPIMAGE

const isWayland =
  process.platform === 'linux' &&
  (process.env.XDG_SESSION_TYPE === 'wayland' ||
    process.env.WAYLAND_DISPLAY !== undefined)

if (isPortable) {
  const portableDataDir = join(process.execPath, '..', 'data')
  if (!existsSync(portableDataDir)) {
    mkdirSync(portableDataDir, { recursive: true })
  }
  app.setPath('userData', portableDataDir)
}

const dataDir = app.getPath('userData')
const filesDir = join(dataDir, 'files')
const logsDir = join(dataDir, 'logs')

for (const dir of [filesDir, logsDir]) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

export { isPortable, isAppImage, isWayland, dataDir, filesDir, logsDir }
