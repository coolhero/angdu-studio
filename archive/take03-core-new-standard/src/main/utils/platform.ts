import { app } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'

export const isMac = process.platform === 'darwin'
export const isWindows = process.platform === 'win32'
export const isLinux = process.platform === 'linux'

export function isWayland(): boolean {
  if (!isLinux) return false
  return (
    process.env.XDG_SESSION_TYPE === 'wayland' || process.env.WAYLAND_DISPLAY !== undefined
  )
}

export function isPortable(): boolean {
  if (isWindows) {
    return process.env.PORTABLE_EXECUTABLE_DIR !== undefined
  }
  if (isLinux) {
    return process.env.APPIMAGE !== undefined
  }
  return false
}

export function isAppImage(): boolean {
  return isLinux && process.env.APPIMAGE !== undefined
}

export function getPortableDataDir(): string | undefined {
  if (isWindows && process.env.PORTABLE_EXECUTABLE_DIR) {
    return join(process.env.PORTABLE_EXECUTABLE_DIR, 'data')
  }
  if (isLinux && process.env.APPIMAGE) {
    const appDir = join(process.env.APPIMAGE, '..')
    const dataDir = join(appDir, `${app.getName()}-data`)
    if (existsSync(dataDir)) {
      return dataDir
    }
  }
  return undefined
}
