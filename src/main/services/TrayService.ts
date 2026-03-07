import { Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import { join } from 'path'

export class TrayService {
  private static instance: TrayService
  private tray: Tray | null = null
  private mainWindow: BrowserWindow | null = null

  private constructor() {}

  static getInstance(): TrayService {
    if (!TrayService.instance) {
      TrayService.instance = new TrayService()
    }
    return TrayService.instance
  }

  init(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow
    this.createTray()
  }

  private createTray(): void {
    const iconPath = this.getIconPath()
    const icon = nativeImage.createFromPath(iconPath)

    if (process.platform === 'darwin') {
      icon.setTemplateImage(true)
    }

    this.tray = new Tray(icon.resize({ width: 16, height: 16 }))
    this.tray.setToolTip('Angdu Studio')

    this.updateContextMenu()

    this.tray.on('click', () => {
      this.mainWindow?.isVisible() ? this.mainWindow.hide() : this.mainWindow?.show()
    })
  }

  private updateContextMenu(): void {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Show Window',
        click: () => {
          this.mainWindow?.show()
          this.mainWindow?.focus()
        }
      },
      {
        label: 'Hide Window',
        click: () => this.mainWindow?.hide()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          const { app } = require('electron')
          app.quit()
        }
      }
    ])

    this.tray?.setContextMenu(menu)
  }

  private getIconPath(): string {
    const base = join(__dirname, '../../build')
    if (process.platform === 'darwin') {
      return join(base, 'tray_icon_light.png')
    }
    return join(base, 'tray_icon.png')
  }

  destroy(): void {
    this.tray?.destroy()
    this.tray = null
  }
}
