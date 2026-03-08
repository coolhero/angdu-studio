import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/ipc-channels'
import { configManager, ConfigKeys } from './ConfigManager'
import type { UpdateCheckResult, UpdateChannel } from '@shared/types'

class UpdateService {
  private isChecking = false

  init(): void {
    const channel = configManager.getUpdateChannel()
    autoUpdater.channel = channel
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', (info) => {
      this.broadcast(IpcChannel.Update_Available, {
        version: info.version,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined
      })
    })

    autoUpdater.on('download-progress', (progress) => {
      this.broadcast(IpcChannel.Update_Progress, {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      this.broadcast(IpcChannel.Update_Downloaded, {
        version: info.version
      })
    })

    // Auto-check on startup if enabled
    if (configManager.get<boolean>(ConfigKeys.AutoUpdate, true)) {
      setTimeout(() => this.checkForUpdates(), 5000)
    }
  }

  async checkForUpdates(): Promise<UpdateCheckResult | null> {
    if (this.isChecking) return null

    try {
      this.isChecking = true
      const result = await autoUpdater.checkForUpdates()
      if (result?.updateInfo) {
        return {
          version: result.updateInfo.version,
          releaseDate: result.updateInfo.releaseDate,
          releaseNotes: typeof result.updateInfo.releaseNotes === 'string'
            ? result.updateInfo.releaseNotes
            : undefined
        }
      }
      return null
    } catch (error) {
      console.error('Update check failed:', error)
      return null
    } finally {
      this.isChecking = false
    }
  }

  async downloadUpdate(): Promise<void> {
    await autoUpdater.downloadUpdate()
  }

  quitAndInstall(): void {
    autoUpdater.quitAndInstall()
  }

  setChannel(channel: UpdateChannel): void {
    autoUpdater.channel = channel
    configManager.set(ConfigKeys.UpdateChannel, channel)
  }

  private broadcast(channel: string, data: unknown): void {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(channel, data)
    }
  }
}

export const updateService = new UpdateService()
