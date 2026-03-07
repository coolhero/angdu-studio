import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { AppService } from './services/AppService'
import { WindowService } from './services/WindowService'
import { ConfigService } from './services/ConfigService'
import { FileStorageService } from './services/FileStorageService'
import { registerAppIpc } from './ipc/app.ipc'
import { registerWindowIpc } from './ipc/window.ipc'
import { registerFileIpc } from './ipc/file.ipc'
import { registerConfigIpc } from './ipc/config.ipc'
import { isMacOS } from './utils/platform'

const appService = new AppService()
const windowService = new WindowService()

// Register custom protocol before app is ready
appService.registerProtocol()

// Acquire single-instance lock
if (!windowService.acquireLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    windowService.show()
  })

  app.whenReady().then(() => {
    // Initialize services
    const configService = new ConfigService()
    const fileStorage = new FileStorageService()

    // Load persisted window state
    windowService.loadWindowState(configService.get('windowState'))

    // Register all IPC handlers
    registerAppIpc(appService)
    registerWindowIpc()
    registerFileIpc(fileStorage)
    registerConfigIpc(configService)

    // Create main window
    const mainWindow = windowService.createMainWindow()

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    // Load the app
    if (process.env.ELECTRON_RENDERER_URL) {
      mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Persist window state on close
    mainWindow.on('close', () => {
      configService.set('windowState', windowService.getWindowState())
    })
  })

  app.on('window-all-closed', () => {
    if (!isMacOS()) {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowService.createMainWindow()
    } else {
      windowService.show()
    }
  })
}
