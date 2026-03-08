import { BrowserWindow, screen } from 'electron'
import windowStateKeeper from 'electron-window-state'
import { join } from 'path'
import { MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT } from '@shared/constants'
import { configManager } from './ConfigManager'
import { getWindowConfig } from '../config'

class WindowService {
  private mainWindow: BrowserWindow | null = null

  createMainWindow(): BrowserWindow {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1280,
      defaultHeight: 800
    })

    // Validate saved position is on a visible display
    const { x, y } = this.validatePosition(mainWindowState.x, mainWindowState.y)

    const windowConfig = getWindowConfig()
    const isDev = !require('electron').app.isPackaged

    this.mainWindow = new BrowserWindow({
      x,
      y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: MIN_WINDOW_WIDTH,
      minHeight: MIN_WINDOW_HEIGHT,
      show: false,
      ...windowConfig,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })

    mainWindowState.manage(this.mainWindow)

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return this.mainWindow
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  private validatePosition(x?: number, y?: number): { x?: number; y?: number } {
    if (x === undefined || y === undefined) return {}

    const displays = screen.getAllDisplays()
    const isOnScreen = displays.some((display) => {
      const { x: dx, y: dy, width, height } = display.bounds
      return x >= dx && x < dx + width && y >= dy && y < dy + height
    })

    if (!isOnScreen) {
      // Center on primary display
      return {}
    }

    return { x, y }
  }
}

export const windowService = new WindowService()
