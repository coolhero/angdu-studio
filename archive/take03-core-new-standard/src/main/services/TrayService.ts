import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import { isMac } from '../utils/platform'
import { t } from './locales'

export class TrayService {
  private tray: Tray | null = null
  private onShowCallback?: () => void
  private onMiniWindowCallback?: () => void

  setCallbacks(options: {
    onShow?: () => void
    onMiniWindow?: () => void
  }): void {
    this.onShowCallback = options.onShow
    this.onMiniWindowCallback = options.onMiniWindow
  }

  createTray(): void {
    const iconPath = this.getIconPath()
    const icon = nativeImage.createFromPath(iconPath)
    if (isMac) {
      icon.setTemplateImage(true)
    }

    this.tray = new Tray(icon)
    this.tray.setToolTip('Cherry Studio')

    this.updateContextMenu()

    this.tray.on('click', () => {
      this.onShowCallback?.()
    })
  }

  updateContextMenu(enableMiniWindow = false): void {
    if (!this.tray) return

    const menuItems = [
      {
        label: t('tray.show'),
        click: () => this.onShowCallback?.()
      },
      ...(enableMiniWindow
        ? [
            {
              label: t('tray.miniWindow'),
              click: () => this.onMiniWindowCallback?.()
            }
          ]
        : []),
      { type: 'separator' as const },
      {
        label: t('tray.quit'),
        click: () => app.quit()
      }
    ]

    const contextMenu = Menu.buildFromTemplate(menuItems)
    this.tray.setContextMenu(contextMenu)
  }

  destroyTray(): void {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }

  private getIconPath(): string {
    const iconDir = join(__dirname, '../../build')
    if (isMac) {
      return join(iconDir, 'tray_icon.png')
    }
    return join(iconDir, 'tray_icon.png')
  }
}
