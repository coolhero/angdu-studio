import { autoUpdater } from 'electron-updater'
import { windowService } from './WindowService'
import { configService } from './ConfigService'
import { logger } from './LoggerService'

class UpdateService {
  private static instance: UpdateService | null = null
  private checkInterval: ReturnType<typeof setInterval> | null = null

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService()
    }
    return UpdateService.instance
  }

  initialize(): void {
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', (info) => {
      const win = windowService.getMainWindow()
      win?.webContents.send('update:available', { version: info.version })
    })

    autoUpdater.on('download-progress', (progress) => {
      const win = windowService.getMainWindow()
      win?.webContents.send('update:progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        total: progress.total,
        transferred: progress.transferred
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      const win = windowService.getMainWindow()
      win?.webContents.send('update:ready', { version: info.version })
    })

    autoUpdater.on('error', (err) => {
      logger.warn('[UpdateService] Update error, will retry next cycle', err.message)
    })

    this.checkForUpdates()
    this.startPeriodicCheck()

    logger.info('[UpdateService] Initialized')
  }

  private checkForUpdates(): void {
    autoUpdater.checkForUpdates().catch((err) => {
      logger.warn('[UpdateService] Update check failed', err.message)
    })
  }

  private startPeriodicCheck(): void {
    const interval = configService.get('updateInterval')
    this.checkInterval = setInterval(() => this.checkForUpdates(), interval)
  }

  pauseChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  resumeChecks(): void {
    if (!this.checkInterval) {
      this.startPeriodicCheck()
    }
  }
}

export const updateService = UpdateService.getInstance()
