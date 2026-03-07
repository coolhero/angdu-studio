import { app } from 'electron'
import { join } from 'node:path'
import { accessSync, constants, existsSync } from 'node:fs'

/**
 * Whether the app is running in portable mode.
 * Portable mode is activated when the PORTABLE_EXECUTABLE_DIR env var is set.
 */
export function isPortableMode(): boolean {
  return !!process.env.PORTABLE_EXECUTABLE_DIR
}

/**
 * Returns the root data directory.
 * - Standard: app.getPath('userData')
 * - Portable: {PORTABLE_EXECUTABLE_DIR}/data/
 */
export function getAppDataPath(): string {
  if (isPortableMode()) {
    return join(process.env.PORTABLE_EXECUTABLE_DIR!, 'data')
  }
  return app.getPath('userData')
}

/** Returns the path for user-uploaded files */
export function getFilesPath(): string {
  return join(getAppDataPath(), 'files')
}

/** Returns the path for log files */
export function getLogsPath(): string {
  return join(getAppDataPath(), 'logs')
}

/** Returns the path for configuration files */
export function getConfigPath(): string {
  return join(getAppDataPath(), 'config')
}

/** Returns the path for note files */
export function getNotesPath(): string {
  return join(getAppDataPath(), 'notes')
}

/**
 * Validates that a directory path exists and is writable.
 */
export function validateDirectoryPath(path: string): boolean {
  try {
    if (!existsSync(path)) return false
    accessSync(path, constants.W_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Sets a custom data directory by updating the userData path.
 * Returns true if the path is valid and was set, false otherwise.
 */
export function setCustomDataDirectory(path: string): boolean {
  if (!validateDirectoryPath(path)) {
    return false
  }
  app.setPath('userData', path)
  return true
}
