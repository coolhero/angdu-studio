import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import { configManager } from '@main/services/ConfigManager'
import { loggerService } from '@main/services/LoggerService'
import type { AppInfo } from '@shared/types'
import { app } from 'electron'

const logger = loggerService.withContext('AppService')

export class AppService {
  private localeOverride: string | null = null

  public getInfo(): AppInfo {
    return {
      version: app.getVersion(),
      isPackaged: app.isPackaged,
      appPath: app.getAppPath(),
      appDataPath: app.getPath('userData'),
      platform: process.platform,
      arch: process.arch
    }
  }

  public quit(): void {
    logger.info('Application quit requested')
    app.quit()
  }

  public relaunch(): void {
    logger.info('Application relaunch requested')
    app.relaunch()
    app.exit(0)
  }

  public getLocale(): string {
    if (this.localeOverride) {
      return this.localeOverride
    }
    return app.getLocale()
  }

  public setLocale(locale: string): void {
    logger.info('Locale changed', { locale })
    this.localeOverride = locale
  }

  public getDataPath(): string {
    return app.getPath('userData')
  }

  /**
   * Migrates data to a new path and relaunches the application.
   * Validates the target is writable, copies all data from the current path,
   * updates ConfigManager, and triggers relaunch.
   */
  public async setDataPath(newPath: string): Promise<void> {
    if (!newPath || newPath.trim() === '') {
      throw new Error('New data path cannot be empty')
    }

    const currentPath = this.getDataPath()

    logger.info('Setting new data path', { from: currentPath, to: newPath })

    // Validate new path is writable by attempting to create it
    try {
      await fsPromises.mkdir(newPath, { recursive: true })
    } catch (err) {
      logger.error('New data path is not writable', { path: newPath, error: String(err) })
      throw err
    }

    // Copy data from current path to new path
    try {
      await fsPromises.cp(currentPath, newPath, { recursive: true, force: true })
    } catch (err) {
      logger.error('Failed to copy data to new path', { from: currentPath, to: newPath, error: String(err) })
      throw err
    }

    // Update ConfigManager with the new path
    configManager.set('dataPath', newPath)

    logger.info('Data path migration complete, relaunching', { newPath })

    // Relaunch the application
    app.relaunch()
    app.exit(0)
  }

  /**
   * Checks whether the application is running in portable mode.
   * Portable mode is detected by the presence of a `.portable` or `portable.dat`
   * marker file adjacent to the application executable.
   */
  public isPortable(): boolean {
    const appPath = app.getAppPath()
    // Resolve to the directory containing the app (go up from app.asar if needed)
    const appDir = path.dirname(appPath)

    const portableMarker = path.join(appDir, '.portable')
    const portableDat = path.join(appDir, 'portable.dat')

    return fs.existsSync(portableMarker) || fs.existsSync(portableDat)
  }
}

export const appService = new AppService()
