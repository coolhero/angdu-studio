import { BrowserWindow } from 'electron'
import { autoUpdater, type UpdateInfo, type CancellationToken } from 'electron-updater'
import { IpcChannel } from '@shared/IpcChannel'
import { ConfigManager } from './ConfigManager'

export class AppUpdater {
  private static instance: AppUpdater
  private configManager: ConfigManager
  private cancellationToken: CancellationToken | null = null

  private constructor() {
    this.configManager = ConfigManager.getInstance()
    this.configure()
  }

  static getInstance(): AppUpdater {
    if (!AppUpdater.instance) {
      AppUpdater.instance = new AppUpdater()
    }
    return AppUpdater.instance
  }

  private configure(): void {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.allowPrerelease = this.configManager.get('updateChannel') !== 'latest'

    // Emit download progress to all renderer windows
    autoUpdater.on('download-progress', (progressObj) => {
      const payload = {
        percent: progressObj.percent,
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total,
      }
      for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) {
          win.webContents.send(IpcChannel.App_UpdateProgress, payload)
        }
      }
    })

    autoUpdater.on('error', (error) => {
      for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) {
          win.webContents.send(IpcChannel.App_UpdateProgress, {
            error: error.message,
          })
        }
      }
    })

    autoUpdater.on('update-downloaded', () => {
      for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) {
          win.webContents.send(IpcChannel.App_UpdateProgress, {
            downloaded: true,
          })
        }
      }
    })
  }

  /**
   * Check for available updates.
   * Returns the current version and update info (null if no update available).
   */
  async checkForUpdates(): Promise<{ currentVersion: string; updateInfo: UpdateInfo | null }> {
    try {
      const result = await autoUpdater.checkForUpdates()
      return {
        currentVersion: autoUpdater.currentVersion.version,
        updateInfo: result?.updateInfo ?? null,
      }
    } catch {
      return {
        currentVersion: autoUpdater.currentVersion.version,
        updateInfo: null,
      }
    }
  }

  /**
   * Trigger download of the available update.
   */
  async downloadUpdate(): Promise<void> {
    const result = await autoUpdater.checkForUpdates()
    if (result?.cancellationToken) {
      this.cancellationToken = result.cancellationToken
    }
    await autoUpdater.downloadUpdate()
  }

  /**
   * Cancel an in-progress download.
   */
  cancelDownload(): void {
    if (this.cancellationToken) {
      this.cancellationToken.cancel()
      this.cancellationToken = null
    }
  }

  /**
   * Quit the application and install the downloaded update.
   */
  quitAndInstall(): void {
    autoUpdater.quitAndInstall()
  }
}
