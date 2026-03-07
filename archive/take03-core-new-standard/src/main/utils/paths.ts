import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'
import { isPortable, getPortableDataDir } from './platform'

function ensureDir(dir: string): string {
  mkdirSync(dir, { recursive: true })
  return dir
}

export function getUserDataPath(): string {
  if (isPortable()) {
    const portableDir = getPortableDataDir()
    if (portableDir) return ensureDir(portableDir)
  }
  return app.getPath('userData')
}

export function getLogsPath(): string {
  return ensureDir(join(getUserDataPath(), 'logs'))
}

export function getFilesPath(): string {
  return ensureDir(join(getUserDataPath(), 'files'))
}

export function getTempPath(): string {
  return ensureDir(join(getUserDataPath(), 'temp'))
}

export function getDownloadsPath(): string {
  return app.getPath('downloads')
}
