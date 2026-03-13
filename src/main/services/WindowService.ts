import { BrowserWindow, screen, app, shell } from 'electron'
import { join } from 'path'
import { existsSync, cpSync, rmSync } from 'fs'
import windowStateKeeper from 'electron-window-state'

import { isMac } from '../constant'
import { ConfigManager } from './ConfigManager'
import { DATA_PATH } from '../config'

export class WindowService {
  private static instance: WindowService

  private mainWindow: BrowserWindow | null = null
  private miniWindow: BrowserWindow | null = null
  private miniPinned = false
  private forceQuit = false
  private lastCrashTime = 0

  private constructor() {}

  static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService()
    }
    return WindowService.instance
  }

  // ─── Main Window ───────────────────────────────────────────────

  createMainWindow(): BrowserWindow {
    const configManager = ConfigManager.getInstance()
    const isDarkTheme = configManager.getTheme() !== 'light'

    const mainWindowState = windowStateKeeper({
      defaultWidth: 960,
      defaultHeight: 600,
    })

    const win = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 960,
      minHeight: 600,
      show: false,
      frame: isMac,
      titleBarStyle: isMac ? 'hidden' : undefined,
      titleBarOverlay: isMac
        ? {
            color: isDarkTheme ? '#1e1e2e' : '#ffffff',
            symbolColor: isDarkTheme ? '#cdd6f4' : '#1e1e2e',
            height: 36,
          }
        : undefined,
      trafficLightPosition: isMac ? { x: 10, y: 10 } : undefined,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    })

    mainWindowState.manage(win)

    this.setupMainWindow(win, configManager)

    // Load renderer
    if (process.env.ELECTRON_RENDERER_URL) {
      win.loadURL(process.env.ELECTRON_RENDERER_URL)
    } else {
      win.loadFile(join(__dirname, '../renderer/index.html'))
    }

    this.mainWindow = win
    return win
  }

  private setupMainWindow(win: BrowserWindow, configManager: ConfigManager): void {
    win.on('ready-to-show', () => {
      if (!configManager.isLaunchToTray()) {
        win.show()
      }
    })

    // Maximize/restore event forwarding to renderer
    win.on('maximize', () => {
      if (!win.isDestroyed()) {
        win.webContents.send('window:maximized-changed', true)
      }
    })
    win.on('unmaximize', () => {
      if (!win.isDestroyed()) {
        win.webContents.send('window:maximized-changed', false)
      }
    })

    // Close behavior: hide to tray or quit
    win.on('close', (event) => {
      if (this.forceQuit) return

      if (configManager.isTrayOnClose() && configManager.isTrayEnabled()) {
        event.preventDefault()
        win.hide()
        if (isMac) {
          app.dock?.hide()
        }
      }
    })

    // Open external links in system browser
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const { shell } = require('electron')
        shell.openExternal(url)
      }
      return { action: 'deny' }
    })

    // Context menu on right-click (dev only)
    if (process.env.ELECTRON_RENDERER_URL) {
      win.webContents.on('context-menu', (_event, params) => {
        const { Menu } = require('electron')
        const menu = Menu.buildFromTemplate([
          { label: 'Inspect Element', click: () => win.webContents.inspectElement(params.x, params.y) },
        ])
        menu.popup()
      })
    }
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  checkMainWindow(): BrowserWindow {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      throw new Error('Main window is not available')
    }
    return this.mainWindow
  }

  showMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    this.mainWindow.show()
    if (this.mainWindow.isMinimized()) {
      this.mainWindow.restore()
    }
    this.mainWindow.focus()
    if (isMac) {
      app.dock?.show()
    }
  }

  setForceQuit(force: boolean): void {
    this.forceQuit = force
  }

  // ─── Mini Window ───────────────────────────────────────────────

  createMiniWindow(): BrowserWindow {
    if (this.miniWindow && !this.miniWindow.isDestroyed()) {
      return this.miniWindow
    }

    const win = new BrowserWindow({
      width: 400,
      height: 600,
      show: false,
      frame: false,
      resizable: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      type: isMac ? 'panel' : undefined,
      transparent: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    })

    // Auto-hide on blur when not pinned
    win.on('blur', () => {
      if (!this.miniPinned && this.miniWindow && !this.miniWindow.isDestroyed()) {
        this.hideMiniWindow()
      }
    })

    win.on('closed', () => {
      this.miniWindow = null
    })

    // Load mini window entry point
    if (process.env.ELECTRON_RENDERER_URL) {
      win.loadURL(process.env.ELECTRON_RENDERER_URL + '/miniWindow.html')
    } else {
      win.loadFile(join(__dirname, '../renderer/miniWindow.html'))
    }

    this.miniWindow = win
    return win
  }

  showMiniWindow(): void {
    if (!this.miniWindow || this.miniWindow.isDestroyed()) {
      this.createMiniWindow()
    }
    const win = this.miniWindow!

    // Position on cursor's current monitor
    const cursorPoint = screen.getCursorScreenPoint()
    const display = screen.getDisplayNearestPoint(cursorPoint)
    const { width: displayWidth, height: displayHeight } = display.workAreaSize
    const { x: displayX, y: displayY } = display.workArea

    const winBounds = win.getBounds()
    const x = Math.round(displayX + displayWidth - winBounds.width - 20)
    const y = Math.round(displayY + (displayHeight - winBounds.height) / 2)

    win.setPosition(x, y)
    win.show()
    win.focus()
  }

  hideMiniWindow(): void {
    if (!this.miniWindow || this.miniWindow.isDestroyed()) return

    if (isMac) {
      this.miniWindow.hide()
    } else {
      this.miniWindow.hide()
    }
  }

  toggleMiniWindow(): void {
    if (!this.miniWindow || this.miniWindow.isDestroyed() || !this.miniWindow.isVisible()) {
      this.showMiniWindow()
    } else {
      this.hideMiniWindow()
    }
  }

  setPinMiniWindow(pinned: boolean): void {
    this.miniPinned = pinned
  }

  closeMiniWindow(): void {
    if (this.miniWindow && !this.miniWindow.isDestroyed()) {
      this.miniWindow.close()
      this.miniWindow = null
    }
  }

  quoteToMainWindow(text: string): void {
    const mainWin = this.mainWindow
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('mini-window:quote', text)
      this.showMainWindow()
    }
  }

  getMiniWindow(): BrowserWindow | null {
    return this.miniWindow
  }

  // ─── Phase 10: Window Extras ──────────────────────────────────

  /**
   * Open external links in the system browser instead of inside the app.
   */
  setupWebContentsHandlers(win?: BrowserWindow): void {
    const target = win ?? this.mainWindow
    if (!target || target.isDestroyed()) return

    target.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        shell.openExternal(url)
      }
      return { action: 'deny' }
    })

    target.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('file://') && !url.startsWith(process.env.ELECTRON_RENDERER_URL || '')) {
        event.preventDefault()
        shell.openExternal(url)
      }
    })
  }

  /**
   * Crash recovery: reload if the renderer crashes and last crash was > 1 minute ago.
   */
  setupMainWindowMonitor(win?: BrowserWindow): void {
    const target = win ?? this.mainWindow
    if (!target || target.isDestroyed()) return

    target.webContents.on('render-process-gone', (_event, details) => {
      const now = Date.now()
      const ONE_MINUTE = 60_000

      if (details.reason !== 'clean-exit' && now - this.lastCrashTime > ONE_MINUTE) {
        this.lastCrashTime = now
        try {
          target.webContents.reload()
        } catch {
          // Window may be destroyed
        }
      }
    })
  }

  /**
   * Remove X-Frame-Options and CSP headers for webview compatibility.
   */
  setupWebRequestHeaders(win?: BrowserWindow): void {
    const target = win ?? this.mainWindow
    if (!target || target.isDestroyed()) return

    target.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = { ...details.responseHeaders }
      const headersToRemove = [
        'x-frame-options',
        'X-Frame-Options',
        'content-security-policy',
        'Content-Security-Policy',
      ]
      for (const header of headersToRemove) {
        delete responseHeaders[header]
      }
      callback({ responseHeaders })
    })
  }

  /**
   * Zoom factor management: restore saved zoom on window ready.
   */
  setupWindowEvents(win?: BrowserWindow): void {
    const target = win ?? this.mainWindow
    if (!target || target.isDestroyed()) return

    const configManager = ConfigManager.getInstance()

    target.webContents.on('did-finish-load', () => {
      const savedZoom = configManager.get('zoomFactor')
      if (savedZoom && savedZoom !== 1.0) {
        target.webContents.setZoomFactor(savedZoom)
      }
    })
  }

  /**
   * Factory reset: close data connections, delete data dir, relaunch.
   */
  factoryReset(): void {
    try {
      // Close all windows
      this.destroyAll()

      // Delete data directory
      if (existsSync(DATA_PATH)) {
        rmSync(DATA_PATH, { recursive: true, force: true })
      }

      // Relaunch
      app.relaunch()
      app.exit(0)
    } catch (error) {
      console.error('Factory reset failed:', error)
    }
  }

  /**
   * Migrate data path: validate new path, copy data, set new path, relaunch.
   */
  migrateDataPath(newPath: string): { success: boolean; error?: string } {
    try {
      if (!newPath || newPath === DATA_PATH) {
        return { success: false, error: 'New path is the same as the current path' }
      }

      // Copy data to new path
      cpSync(DATA_PATH, newPath, { recursive: true })

      // Relaunch with new path
      app.relaunch()
      app.exit(0)

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: message }
    }
  }

  // ─── Cleanup ───────────────────────────────────────────────────

  destroyAll(): void {
    if (this.miniWindow && !this.miniWindow.isDestroyed()) {
      this.miniWindow.destroy()
      this.miniWindow = null
    }
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.destroy()
      this.mainWindow = null
    }
  }
}
