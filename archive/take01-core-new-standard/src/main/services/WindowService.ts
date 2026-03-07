import { BrowserWindow, nativeTheme, Tray, Menu, app } from 'electron'
import { join } from 'node:path'
import { isMacOS } from '../utils/platform'

export interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

const DEFAULT_WINDOW_STATE: WindowState = {
  width: 1200,
  height: 800,
  isMaximized: false
}

/**
 * Manages the main BrowserWindow, tray icon, and single-instance lock.
 */
export class WindowService {
  private mainWindow: BrowserWindow | null = null
  private tray: Tray | null = null
  private windowState: WindowState = { ...DEFAULT_WINDOW_STATE }

  /** Acquires the single-instance lock. Returns false if another instance is running. */
  acquireLock(): boolean {
    return app.requestSingleInstanceLock()
  }

  /** Loads persisted window state (size, position, maximized). */
  loadWindowState(state: Partial<WindowState> | undefined): void {
    if (state) {
      this.windowState = { ...DEFAULT_WINDOW_STATE, ...state }
    }
  }

  /** Returns the current window state for persistence. */
  getWindowState(): WindowState {
    if (!this.mainWindow) return this.windowState

    const bounds = this.mainWindow.getBounds()
    return {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: this.mainWindow.isMaximized()
    }
  }

  /** Creates and returns the main BrowserWindow. */
  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: this.windowState.width,
      height: this.windowState.height,
      x: this.windowState.x,
      y: this.windowState.y,
      minWidth: 1000,
      minHeight: 600,
      show: false,
      titleBarStyle: isMacOS() ? 'hiddenInset' : 'default',
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    if (this.windowState.isMaximized) {
      this.mainWindow.maximize()
    }

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    return this.mainWindow
  }

  /** Returns the main BrowserWindow instance, or null. */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  /** Creates the system tray icon with context menu. */
  createTray(iconDir: string): Tray {
    const isDark = nativeTheme.shouldUseDarkColors
    const iconName = isDark ? 'tray-dark.png' : 'tray-light.png'
    const iconPath = join(iconDir, iconName)

    this.tray = new Tray(iconPath)
    this.tray.setToolTip('Cherry Studio')

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show', click: () => this.show() },
      { label: 'Quit', click: () => app.quit() }
    ])
    this.tray.setContextMenu(contextMenu)

    this.tray.on('click', () => this.toggle())

    return this.tray
  }

  /** Shows the main window. */
  show(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore()
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }

  /** Hides the main window. */
  hide(): void {
    this.mainWindow?.hide()
  }

  /** Toggles the main window visibility. */
  toggle(): void {
    if (this.mainWindow?.isVisible()) {
      this.hide()
    } else {
      this.show()
    }
  }

  /** Returns whether the main window is maximized. */
  isMaximized(): boolean {
    return this.mainWindow?.isMaximized() ?? false
  }
}
