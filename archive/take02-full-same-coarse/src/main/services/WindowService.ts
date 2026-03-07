import { join } from 'node:path'
import { titleBarOverlayDark, titleBarOverlayLight } from '@main/config'
import { isDev, isMac } from '@main/constant'
import { loggerService } from '@main/services/LoggerService'
import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH, MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from '@shared/config/index'
import { BrowserWindow, nativeTheme, shell } from 'electron'
import windowStateKeeper from 'electron-window-state'

const logger = loggerService.withContext('WindowService')

export class WindowService {
  private static instance: WindowService | null = null
  private mainWindow: BrowserWindow | null = null
  private windows: Map<number, BrowserWindow> = new Map()

  public static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService()
    }
    return WindowService.instance
  }

  public createMainWindow(): BrowserWindow {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.show()
      this.mainWindow.focus()
      return this.mainWindow
    }

    const mainWindowState = windowStateKeeper({
      defaultWidth: DEFAULT_WINDOW_WIDTH,
      defaultHeight: DEFAULT_WINDOW_HEIGHT
    })

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: MIN_WINDOW_WIDTH,
      minHeight: MIN_WINDOW_HEIGHT,
      show: false,
      autoHideMenuBar: true,
      ...(isMac
        ? {
            titleBarStyle: 'hidden',
            titleBarOverlay: nativeTheme.shouldUseDarkColors ? titleBarOverlayDark : titleBarOverlayLight,
            trafficLightPosition: { x: 8, y: 13 }
          }
        : {
            frame: false
          }),
      backgroundColor: isMac ? undefined : nativeTheme.shouldUseDarkColors ? '#181818' : '#FFFFFF',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        webSecurity: false,
        webviewTag: true
      }
    })

    this.setupMainWindow(this.mainWindow, mainWindowState)

    logger.info('Main window created', {
      width: mainWindowState.width,
      height: mainWindowState.height
    })

    return this.mainWindow
  }

  private setupMainWindow(mainWindow: BrowserWindow, mainWindowState: ReturnType<typeof windowStateKeeper>): void {
    mainWindowState.manage(mainWindow)

    this.setupWindowEvents(mainWindow)
    this.setupWebContentsHandlers(mainWindow)
    this.loadMainWindowContent(mainWindow)
  }

  private setupWindowEvents(mainWindow: BrowserWindow): void {
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private setupWebContentsHandlers(mainWindow: BrowserWindow): void {
    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url.includes('localhost:517')) {
        return
      }
      event.preventDefault()
      shell.openExternal(url)
    })
  }

  private loadMainWindowContent(mainWindow: BrowserWindow): void {
    if (isDev && process.env.ELECTRON_RENDERER_URL) {
      mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
      mainWindow.webContents.openDevTools()
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  public showMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.show()
      this.mainWindow.focus()
    } else {
      this.mainWindow = this.createMainWindow()
    }
  }

  /**
   * Opens a compact mini window (400x600, always-on-top).
   * Loads the miniWindow renderer entry point.
   */
  public openMini(): BrowserWindow {
    const miniWindow = new BrowserWindow({
      width: 400,
      height: 600,
      alwaysOnTop: true,
      resizable: true,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        webSecurity: false
      }
    })

    this.registerWindow(miniWindow)

    miniWindow.once('ready-to-show', () => {
      miniWindow.show()
    })

    if (isDev && process.env.ELECTRON_RENDERER_URL) {
      const baseUrl = process.env.ELECTRON_RENDERER_URL
      miniWindow.loadURL(`${baseUrl}/miniWindow.html`)
    } else {
      miniWindow.loadFile(join(__dirname, '../renderer/miniWindow.html'))
    }

    logger.info('Mini window opened', { windowId: miniWindow.id })

    return miniWindow
  }

  /**
   * Opens a frameless floating selection toolbar.
   * Loads the selectionToolbar renderer entry point.
   */
  public openSelection(): BrowserWindow {
    const selectionWindow = new BrowserWindow({
      width: 360,
      height: 64,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        contextIsolation: true,
        webSecurity: false
      }
    })

    this.registerWindow(selectionWindow)

    selectionWindow.once('ready-to-show', () => {
      selectionWindow.show()
    })

    if (isDev && process.env.ELECTRON_RENDERER_URL) {
      const baseUrl = process.env.ELECTRON_RENDERER_URL
      selectionWindow.loadURL(`${baseUrl}/selectionToolbar.html`)
    } else {
      selectionWindow.loadFile(join(__dirname, '../renderer/selectionToolbar.html'))
    }

    logger.info('Selection toolbar opened', { windowId: selectionWindow.id })

    return selectionWindow
  }

  /**
   * Gets a window by its id from the registry.
   */
  public getWindow(id: number): BrowserWindow | undefined {
    return this.windows.get(id)
  }

  /**
   * Closes a window by its id.
   */
  public closeWindow(id: number): void {
    const win = this.windows.get(id)
    if (win && !win.isDestroyed()) {
      win.close()
    }
  }

  /**
   * Registers a secondary window in the registry and sets up cleanup on close.
   */
  private registerWindow(win: BrowserWindow): void {
    this.windows.set(win.id, win)
    win.on('closed', () => {
      this.windows.delete(win.id)
      logger.info('Window closed and removed from registry', { windowId: win.id })
    })
  }
}

export const windowService = WindowService.getInstance()
