import path from 'node:path'
import { loggerService } from '@main/services/LoggerService'
import { windowService } from '@main/services/WindowService'
import { app, Menu, nativeImage, Tray } from 'electron'

const logger = loggerService.withContext('TrayService')

class TrayService {
  private tray: Tray | null = null

  init(): void {
    if (this.tray && !this.tray.isDestroyed()) {
      logger.warn('Tray already initialized')
      return
    }

    const icon = this.createIcon()
    this.tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Restore',
        click: () => {
          windowService.showMainWindow()
        }
      },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)

    this.tray.on('click', () => {
      windowService.showMainWindow()
    })

    logger.info('Tray initialized')
  }

  destroy(): void {
    if (this.tray && !this.tray.isDestroyed()) {
      this.tray.destroy()
      logger.info('Tray destroyed')
    }
    this.tray = null
  }

  private createIcon(): Electron.NativeImage {
    const iconPath = this.getIconPath()

    try {
      const icon = nativeImage.createFromPath(iconPath)
      if (icon.isEmpty()) {
        logger.warn('Tray icon file not found or empty, using empty image', { iconPath })
        return nativeImage.createEmpty()
      }
      return icon
    } catch {
      logger.warn('Failed to load tray icon, using empty image', { iconPath })
      return nativeImage.createEmpty()
    }
  }

  private getIconPath(): string {
    // Expected icon files in src/renderer/src/assets/tray/:
    // - trayTemplate.png (macOS, auto-selects @2x variant)
    // - tray.ico (Windows)
    // - tray.png (Linux)
    const assetsDir = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'tray')
      : path.join(__dirname, '../../renderer/src/assets/tray')

    if (process.platform === 'darwin') {
      return path.join(assetsDir, 'trayTemplate.png')
    }

    if (process.platform === 'win32') {
      return path.join(assetsDir, 'tray.ico')
    }

    return path.join(assetsDir, 'tray.png')
  }
}

export const trayService = new TrayService()
