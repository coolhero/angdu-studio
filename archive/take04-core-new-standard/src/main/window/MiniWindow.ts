import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let miniWindow: BrowserWindow | null = null
let isPinned = false

export function createMiniWindow(): BrowserWindow {
  if (miniWindow && !miniWindow.isDestroyed()) {
    return miniWindow
  }

  miniWindow = new BrowserWindow({
    width: 550,
    height: 400,
    minWidth: 350,
    minHeight: 380,
    maxWidth: 1024,
    maxHeight: 768,
    frame: false,
    alwaysOnTop: true,
    show: false,
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  miniWindow.setVisibleOnAllWorkspaces(true)

  miniWindow.on('blur', () => {
    if (!isPinned && miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.hide()
    }
  })

  miniWindow.on('closed', () => {
    miniWindow = null
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    miniWindow.loadURL(`${process.env.ELECTRON_RENDERER_URL}/miniWindow.html`)
  } else {
    miniWindow.loadFile(join(__dirname, '../renderer/miniWindow.html'))
  }

  return miniWindow
}

export function showMiniWindow(): void {
  const win = getMiniWindow() ?? createMiniWindow()
  centerOnCursorScreen(win)
  win.show()
  win.focus()
}

export function hideMiniWindow(): void {
  miniWindow?.hide()
}

export function toggleMiniWindow(): void {
  if (miniWindow?.isVisible()) {
    hideMiniWindow()
  } else {
    showMiniWindow()
  }
}

export function setMiniWindowPin(pinned: boolean): void {
  isPinned = pinned
}

export function getMiniWindow(): BrowserWindow | null {
  return miniWindow && !miniWindow.isDestroyed() ? miniWindow : null
}

function centerOnCursorScreen(win: BrowserWindow): void {
  const cursor = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursor)
  const { x, y, width, height } = display.workArea
  const bounds = win.getBounds()
  const newX = Math.round(x + (width - bounds.width) / 2)
  const newY = Math.round(y + (height - bounds.height) / 2)
  win.setPosition(newX, newY)
}
