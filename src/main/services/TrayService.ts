import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'

import { isMac } from '../constant'
import { ConfigManager } from './ConfigManager'
import { WindowService } from './WindowService'

export class TrayService {
  private static instance: TrayService

  private tray: Tray | null = null
  private unsubscribers: Array<() => void> = []

  private constructor() {}

  static getInstance(): TrayService {
    if (!TrayService.instance) {
      TrayService.instance = new TrayService()
    }
    return TrayService.instance
  }

  createTray(): void {
    if (this.tray) return

    const icon = this.createTrayIcon()
    this.tray = new Tray(icon)

    this.tray.setToolTip('Angdu Studio')
    this.updateContextMenu()

    // Click handler
    this.tray.on('click', () => {
      this.handleTrayClick()
    })

    // Double-click on Windows/Linux shows main window
    if (!isMac) {
      this.tray.on('double-click', () => {
        WindowService.getInstance().showMainWindow()
      })
    }

    this.watchConfigChanges()
  }

  private createTrayIcon(): Electron.NativeImage {
    // Try to load icon from resources, fall back to a programmatic 16x16 icon
    const iconName = isMac ? 'trayTemplate.png' : 'tray.png'
    const resourcePath = app.isPackaged
      ? join(process.resourcesPath, iconName)
      : join(app.getAppPath(), 'resources', iconName)

    try {
      const icon = nativeImage.createFromPath(resourcePath)
      if (!icon.isEmpty()) {
        if (isMac) icon.setTemplateImage(true)
        return icon
      }
    } catch {
      // Fall through to generated icon
    }

    // Generate a simple 16x16 placeholder tray icon
    const size = 16
    const canvas = Buffer.alloc(size * size * 4)
    for (let i = 0; i < size * size; i++) {
      const x = i % size
      const y = Math.floor(i / size)
      const inCircle =
        Math.pow(x - size / 2 + 0.5, 2) + Math.pow(y - size / 2 + 0.5, 2) <
        Math.pow(size / 2 - 1, 2)
      const offset = i * 4
      if (inCircle) {
        // Blue-ish color: RGBA
        canvas[offset] = 100 // R
        canvas[offset + 1] = 149 // G
        canvas[offset + 2] = 237 // B
        canvas[offset + 3] = 255 // A
      } else {
        canvas[offset + 3] = 0 // Transparent
      }
    }
    const icon = nativeImage.createFromBuffer(canvas, { width: size, height: size })
    if (isMac) icon.setTemplateImage(true)
    return icon
  }

  updateContextMenu(): void {
    if (!this.tray) return

    const windowService = WindowService.getInstance()
    const configManager = ConfigManager.getInstance()
    const clickToQuickAssistant = configManager.get('clickTrayToShowQuickAssistant')

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Window',
        click: () => {
          windowService.showMainWindow()
        },
      },
      {
        label: 'Mini Window',
        click: () => {
          windowService.toggleMiniWindow()
        },
      },
      { type: 'separator' },
      {
        label: 'Quick Assistant on Click',
        type: 'checkbox',
        checked: clickToQuickAssistant,
        click: (menuItem) => {
          configManager.set('clickTrayToShowQuickAssistant', menuItem.checked)
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          windowService.setForceQuit(true)
          app.quit()
        },
      },
    ])

    this.tray.setContextMenu(contextMenu)
  }

  private handleTrayClick(): void {
    const configManager = ConfigManager.getInstance()
    const windowService = WindowService.getInstance()

    if (configManager.get('clickTrayToShowQuickAssistant')) {
      windowService.toggleMiniWindow()
    } else {
      windowService.showMainWindow()
    }
  }

  watchConfigChanges(): void {
    const configManager = ConfigManager.getInstance()

    // Rebuild menu when the quick-assistant toggle changes
    const unsub1 = configManager.subscribe('clickTrayToShowQuickAssistant', () => {
      this.updateContextMenu()
    })

    // Rebuild menu on language change (for future i18n)
    const unsub2 = configManager.subscribe('language', () => {
      this.updateContextMenu()
    })

    // Watch tray enabled toggle
    const unsub3 = configManager.subscribe('trayEnabled', (enabled) => {
      if (enabled) {
        if (!this.tray) this.createTray()
      } else {
        this.destroy()
      }
    })

    this.unsubscribers.push(unsub1, unsub2, unsub3)
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
