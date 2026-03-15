import { Tray, Menu, app, nativeImage } from 'electron'
import { join } from 'path'
import { windowService } from './WindowService'
import { logger } from './LoggerService'

class TrayService {
  private static instance: TrayService | null = null
  private tray: Tray | null = null

  static getInstance(): TrayService {
    if (!TrayService.instance) {
      TrayService.instance = new TrayService()
    }
    return TrayService.instance
  }

  initialize(): void {
    const iconPath = join(__dirname, '../../resources/icon.png')
    let icon: Electron.NativeImage

    try {
      icon = nativeImage.createFromPath(iconPath)
      if (icon.isEmpty()) {
        icon = nativeImage.createEmpty()
      }
    } catch {
      icon = nativeImage.createEmpty()
    }

    if (process.platform === 'darwin') {
      icon = icon.resize({ width: 16, height: 16 })
      icon.setTemplateImage(true)
    }

    this.tray = new Tray(icon)
    this.tray.setToolTip('Angdu Studio')

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide Window',
        click: () => windowService.toggleMainWindow()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          ;(app as unknown as { isQuitting: boolean }).isQuitting = true
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)

    this.tray.on('click', () => {
      windowService.toggleMainWindow()
    })

    logger.info('[TrayService] Initialized')
  }
}

export const trayService = TrayService.getInstance()
