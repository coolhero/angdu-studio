import { BrowserWindow, shell } from 'electron'
import windowStateKeeper from 'electron-window-state'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { platformService } from '../services/PlatformService'
import { configManager } from '../config'
import { ConfigKeys } from '@shared/types'

let mainWindow: BrowserWindow | null = null

export function createMainWindow(): BrowserWindow {
  const windowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800
  })

  const useSystemTitleBar =
    platformService.isLinux && configManager.get<boolean>(ConfigKeys.UseSystemTitleBar)

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    frame: platformService.isMacOS || useSystemTitleBar,
    titleBarStyle: platformService.isMacOS ? 'hiddenInset' : undefined,
    trafficLightPosition: platformService.isMacOS ? { x: 8, y: 10 } : undefined,
    titleBarOverlay: platformService.isWindows
      ? { color: '#ffffff', symbolColor: '#000000', height: 36 }
      : undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  windowState.manage(mainWindow)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (windowState.isMaximized) {
      mainWindow?.maximize()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
