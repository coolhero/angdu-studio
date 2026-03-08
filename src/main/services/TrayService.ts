import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron'
import { join } from 'path'
import process from 'node:process'
import { configManager, ConfigKeys } from './ConfigManager'

const isMac = process.platform === 'darwin'

class TrayService {
  private tray: Tray | null = null

  init(mainWindow: BrowserWindow): void {
    if (configManager.getTray()) {
      this.create(mainWindow)
    }

    configManager.subscribe(ConfigKeys.Tray, (enabled) => {
      if (enabled) {
        this.create(mainWindow)
      } else {
        this.destroy()
      }
    })
  }

  create(mainWindow: BrowserWindow): void {
    if (this.tray) return

    const iconPath = this.getIconPath()
    const icon = nativeImage.createFromPath(iconPath)

    if (isMac) {
      icon.setTemplateImage(true)
    }

    this.tray = new Tray(icon.resize({ width: 16, height: 16 }))
    this.tray.setToolTip('Angdu Studio')

    const contextMenu = this.buildContextMenu(mainWindow)
    this.tray.setContextMenu(contextMenu)

    this.tray.on('click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    })
  }

  private buildContextMenu(mainWindow: BrowserWindow): Menu {
    return Menu.buildFromTemplate([
      {
        label: mainWindow.isVisible() ? '숨기기' : '보이기',
        click: () => {
          if (mainWindow.isVisible()) {
            mainWindow.hide()
          } else {
            mainWindow.show()
            mainWindow.focus()
          }
        }
      },
      { type: 'separator' },
      {
        label: '종료',
        click: () => {
          app.quit()
        }
      }
    ])
  }

  private getIconPath(): string {
    const resourcesPath = app.isPackaged
      ? join(process.resourcesPath, 'resources')
      : join(__dirname, '../../resources')

    if (isMac) {
      return join(resourcesPath, 'tray', 'iconTemplate.png')
    }
    return join(resourcesPath, 'tray', 'icon.png')
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }

  isCreated(): boolean {
    return this.tray !== null
  }
}

export const trayService = new TrayService()
