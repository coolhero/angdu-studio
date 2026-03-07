import { BrowserWindow, app, shell } from 'electron'
import windowStateKeeper from 'electron-window-state'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { CRASH_RECOVERY_THRESHOLD_MS } from '@shared/constants'

export class WindowService {
  private static instance: WindowService
  private mainWindow: BrowserWindow | null = null
  private lastCrashTime = 0

  private constructor() {}

  static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService()
    }
    return WindowService.instance
  }

  createMainWindow(): BrowserWindow {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800
    })

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'darwin'
        ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 8, y: 10 } }
        : {}),
      ...(process.platform === 'linux' ? { icon: join(__dirname, '../../build/icon.png') } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    mainWindowState.manage(this.mainWindow)

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    this.setupCrashRecovery()

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return this.mainWindow
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  showMainWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore()
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  hideMainWindow(): void {
    this.mainWindow?.hide()
  }

  minimizeMainWindow(): void {
    this.mainWindow?.minimize()
  }

  toggleMaximize(): void {
    if (this.mainWindow?.isMaximized()) {
      this.mainWindow.unmaximize()
    } else {
      this.mainWindow?.maximize()
    }
  }

  closeMainWindow(): void {
    this.mainWindow?.close()
  }

  setSize(width: number, height: number): void {
    this.mainWindow?.setSize(width, height)
  }

  setPosition(x: number, y: number): void {
    this.mainWindow?.setPosition(x, y)
  }

  getWindowState(): { x: number; y: number; width: number; height: number; isMaximized: boolean } {
    const bounds = this.mainWindow?.getBounds() ?? { x: 0, y: 0, width: 1200, height: 800 }
    return {
      ...bounds,
      isMaximized: this.mainWindow?.isMaximized() ?? false
    }
  }

  setAlwaysOnTop(enabled: boolean): void {
    this.mainWindow?.setAlwaysOnTop(enabled)
  }

  setFullscreen(enabled: boolean): void {
    this.mainWindow?.setFullScreen(enabled)
  }

  private setupCrashRecovery(): void {
    this.mainWindow?.webContents.on('render-process-gone', (_event, details) => {
      if (details.reason === 'crashed' || details.reason === 'killed') {
        const now = Date.now()
        if (now - this.lastCrashTime < CRASH_RECOVERY_THRESHOLD_MS) {
          app.quit()
        } else {
          this.lastCrashTime = now
          this.mainWindow?.webContents.reload()
        }
      }
    })
  }
}
