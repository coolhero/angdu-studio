import { configManager } from '@main/services/ConfigManager'
import { loggerService } from '@main/services/LoggerService'
import type { UpdateInfo } from '@shared/types'
import { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

const logger = loggerService.withContext('AppUpdater')

class AppUpdater {
  init(): void {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    const channel = configManager.getUpdateChannel()
    autoUpdater.channel = channel
    logger.info('AppUpdater initialized', { channel })

    this.registerEventListeners()
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      logger.info('Checking for updates...')
      const result = await autoUpdater.checkForUpdates()

      if (!result || !result.updateInfo) {
        logger.info('No updates available')
        return null
      }

      const updateInfo: UpdateInfo = {
        version: result.updateInfo.version,
        releaseDate: result.updateInfo.releaseDate,
        releaseNotes: typeof result.updateInfo.releaseNotes === 'string' ? result.updateInfo.releaseNotes : '',
        channel: (configManager.getUpdateChannel() as UpdateInfo['channel']) || 'stable'
      }

      logger.info('Update available', { version: updateInfo.version })
      return updateInfo
    } catch (error) {
      logger.error('Failed to check for updates', {
        error: error instanceof Error ? error.message : String(error)
      })
      return null
    }
  }

  downloadUpdate(): void {
    logger.info('Downloading update...')
    autoUpdater.downloadUpdate()
  }

  installUpdate(): void {
    logger.info('Installing update and restarting...')
    autoUpdater.quitAndInstall()
  }

  private registerEventListeners(): void {
    autoUpdater.on('update-available', (info) => {
      logger.info('Update available event', { version: info.version })
      const updateInfo: UpdateInfo = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : '',
        channel: (configManager.getUpdateChannel() as UpdateInfo['channel']) || 'stable'
      }
      this.sendToRenderer('app:update-available', updateInfo)
    })

    autoUpdater.on('update-not-available', (info) => {
      logger.info('No update available', { version: info.version })
      this.sendToRenderer('app:update-not-available', info)
    })

    autoUpdater.on('download-progress', (progress) => {
      logger.debug('Download progress', { percent: progress.percent })
      this.sendToRenderer('app:update-progress', progress)
    })

    autoUpdater.on('update-downloaded', (info) => {
      logger.info('Update downloaded', { version: info.version })
      const updateInfo: UpdateInfo = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : '',
        channel: (configManager.getUpdateChannel() as UpdateInfo['channel']) || 'stable'
      }
      this.sendToRenderer('app:update-downloaded', updateInfo)
    })

    autoUpdater.on('error', (error) => {
      logger.error('Update error', { error: error.message })
      this.sendToRenderer('app:update-error', error.message)
    })
  }

  private sendToRenderer(channel: string, data: unknown): void {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      win.webContents.send(channel, data)
    }
  }
}

export const appUpdater = new AppUpdater()
