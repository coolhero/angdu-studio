import { BrowserWindow, screen, nativeTheme } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT } from '@shared/types/window'
import type { WindowState } from '@shared/types/window'
import { configService } from './ConfigService'
import { logger } from './LoggerService'

class WindowService {
  private static instance: WindowService | null = null
  private mainWindow: BrowserWindow | null = null
  private stateDebounceTimer: ReturnType<typeof setTimeout> | null = null

  static getInstance(): WindowService {
    if (!WindowService.instance) {
      WindowService.instance = new WindowService()
    }
    return WindowService.instance
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  createMainWindow(): BrowserWindow {
    const savedState = configService.getWindowState('main')
    const bounds = this.validateBounds(savedState)

    const isMac = process.platform === 'darwin'
    const isLinux = process.platform === 'linux'

    this.mainWindow = new BrowserWindow({
      x: bounds.x ?? undefined,
      y: bounds.y ?? undefined,
      width: bounds.width,
      height: bounds.height,
      minWidth: MIN_WINDOW_WIDTH,
      minHeight: MIN_WINDOW_HEIGHT,
      show: false,
      ...(isMac
        ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 12, y: 10 } }
        : { frame: isLinux ? false : false }),
      backgroundColor: nativeTheme.shouldUseDarkColors ? '#181818' : '#FFFFFF',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false
      }
    })

    if (savedState.isMaximized) {
      this.mainWindow.maximize()
    }

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDesc) => {
      logger.error(`[WindowService] Failed to load renderer: ${errorCode} ${errorDesc}`)
      this.mainWindow?.show()
    })

    this.setupWindowEvents()

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    logger.info('[WindowService] Main window created')
    return this.mainWindow
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return

    const saveState = () => {
      if (this.stateDebounceTimer) clearTimeout(this.stateDebounceTimer)
      this.stateDebounceTimer = setTimeout(() => this.persistWindowState(), 300)
    }

    this.mainWindow.on('resize', saveState)
    this.mainWindow.on('move', saveState)
    this.mainWindow.on('maximize', saveState)
    this.mainWindow.on('unmaximize', saveState)

    this.mainWindow.on('focus', () => {
      this.mainWindow?.webContents.send('window:focus')
    })

    this.mainWindow.on('blur', () => {
      this.mainWindow?.webContents.send('window:blur')
    })
  }

  private persistWindowState(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return

    const bounds = this.mainWindow.getBounds()
    const isMaximized = this.mainWindow.isMaximized()
    const display = screen.getDisplayMatching(bounds)

    const state: WindowState = {
      id: 'main',
      x: isMaximized ? null : bounds.x,
      y: isMaximized ? null : bounds.y,
      width: isMaximized ? MIN_WINDOW_WIDTH : bounds.width,
      height: isMaximized ? MIN_WINDOW_HEIGHT : bounds.height,
      isMaximized,
      displayId: display ? String(display.id) : null
    }

    configService.setWindowState(state)

    this.mainWindow.webContents.send('window:state-changed', state)
  }

  private validateBounds(state: WindowState): WindowState {
    if (state.x === null || state.y === null) {
      return state
    }

    const displays = screen.getAllDisplays()
    const isOnScreen = displays.some((display) => {
      const { x, y, width, height } = display.bounds
      return (
        state.x! >= x - 100 &&
        state.x! <= x + width + 100 &&
        state.y! >= y - 100 &&
        state.y! <= y + height + 100
      )
    })

    if (!isOnScreen) {
      logger.info('[WindowService] Saved position is offscreen, resetting to center')
      return { ...state, x: null, y: null }
    }

    return state
  }

  showMainWindow(): void {
    if (!this.mainWindow) return
    if (this.mainWindow.isMinimized()) this.mainWindow.restore()
    this.mainWindow.show()
    this.mainWindow.focus()
  }

  hideMainWindow(): void {
    this.mainWindow?.hide()
  }

  isMainWindowVisible(): boolean {
    return this.mainWindow?.isVisible() ?? false
  }

  toggleMainWindow(): void {
    if (this.isMainWindowVisible()) {
      this.hideMainWindow()
    } else {
      this.showMainWindow()
    }
  }
}

export const windowService = WindowService.getInstance()
