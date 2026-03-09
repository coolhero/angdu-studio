import { BrowserWindow } from 'electron'
import { join } from 'path'
import { MINI_WINDOW_WIDTH, MINI_WINDOW_HEIGHT } from '@shared/constants'

class MiniWindowService {
  private window: BrowserWindow | null = null

  create(): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.window.show()
      return this.window
    }

    this.window = new BrowserWindow({
      width: MINI_WINDOW_WIDTH,
      height: MINI_WINDOW_HEIGHT,
      show: false,
      resizable: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: false
      }
    })

    this.window.on('closed', () => {
      this.window = null
    })

    this.window.on('ready-to-show', () => {
      this.window?.show()
    })

    const isDev = !require('electron').app.isPackaged
    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
      this.window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.window.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return this.window
  }

  show(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.show()
    } else {
      this.create()
    }
  }

  hide(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.hide()
    }
  }

  close(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy()
      this.window = null
    }
  }

  toggle(): void {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.hide()
    } else {
      this.show()
    }
  }

  setPin(isPinned: boolean): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.setAlwaysOnTop(isPinned)
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window
  }
}

export const miniWindowService = new MiniWindowService()
