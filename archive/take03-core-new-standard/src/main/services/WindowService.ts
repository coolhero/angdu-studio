import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import windowStateKeeper from 'electron-window-state'
import {
  MIN_WINDOW_WIDTH,
  MIN_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  CRASH_RECOVERY_THRESHOLD_MS
} from '@shared/constants'
import { IpcChannel } from '@shared/IpcChannel'
import { isMac, isLinux } from '../utils/platform'

export class WindowService {
  private mainWindow: BrowserWindow | null = null
  private lastCrashTime = 0

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  createMainWindow(): BrowserWindow {
    const windowState = windowStateKeeper({
      defaultWidth: DEFAULT_WINDOW_WIDTH,
      defaultHeight: DEFAULT_WINDOW_HEIGHT
    })

    this.mainWindow = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      minWidth: MIN_WINDOW_WIDTH,
      minHeight: MIN_WINDOW_HEIGHT,
      show: false,
      titleBarStyle: isMac ? 'hiddenInset' : 'default',
      ...(isLinux ? { icon: join(__dirname, '../../build/icon.png') } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })

    windowState.manage(this.mainWindow)

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
      if (windowState.isMaximized) {
        this.mainWindow?.maximize()
      }
    })

    this.mainWindow.on('maximize', () => {
      this.mainWindow?.webContents.send(IpcChannel.Window_MaximizedChanged, true)
    })

    this.mainWindow.on('unmaximize', () => {
      this.mainWindow?.webContents.send(IpcChannel.Window_MaximizedChanged, false)
    })

    this.mainWindow.on('enter-full-screen', () => {
      this.mainWindow?.webContents.send(IpcChannel.Window_FullscreenChanged, true)
    })

    this.mainWindow.on('leave-full-screen', () => {
      this.mainWindow?.webContents.send(IpcChannel.Window_FullscreenChanged, false)
    })

    this.mainWindow.on('resize', () => {
      const size = this.mainWindow?.getSize()
      if (size) {
        this.mainWindow?.webContents.send(IpcChannel.Window_Resize, size[0], size[1])
      }
    })

    // Renderer crash recovery (FR-019)
    this.mainWindow.webContents.on('render-process-gone', (_event, details) => {
      if (details.reason === 'crashed' || details.reason === 'oom') {
        const now = Date.now()
        if (now - this.lastCrashTime > CRASH_RECOVERY_THRESHOLD_MS) {
          this.lastCrashTime = now
          this.mainWindow?.webContents.reload()
        } else {
          const { app } = require('electron')
          app.quit()
        }
      }
    })

    // Load renderer
    if (process.env.ELECTRON_RENDERER_URL) {
      this.mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    return this.mainWindow
  }

  minimize(): void {
    this.mainWindow?.minimize()
  }

  maximize(): void {
    this.mainWindow?.maximize()
  }

  unmaximize(): void {
    this.mainWindow?.unmaximize()
  }

  close(): void {
    this.mainWindow?.close()
  }

  isMaximized(): boolean {
    return this.mainWindow?.isMaximized() ?? false
  }

  getSize(): [number, number] {
    return (this.mainWindow?.getSize() as [number, number]) ?? [
      DEFAULT_WINDOW_WIDTH,
      DEFAULT_WINDOW_HEIGHT
    ]
  }

  setMinimumSize(width: number, height: number): void {
    this.mainWindow?.setMinimumSize(width, height)
  }

  resetMinimumSize(): void {
    this.mainWindow?.setMinimumSize(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT)
  }

  showAndFocus(): void {
    if (!this.mainWindow) return
    if (this.mainWindow.isMinimized()) this.mainWindow.restore()
    this.mainWindow.show()
    this.mainWindow.focus()
  }

  sendToAll(channel: IpcChannel, ...args: unknown[]): void {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, ...args)
      }
    }
  }
}
