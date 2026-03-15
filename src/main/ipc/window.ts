import { ipcMain } from 'electron'
import { windowService } from '../services/WindowService'

export function registerWindowHandlers(): void {
  ipcMain.handle('window:minimize', () => {
    windowService.getMainWindow()?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    const win = windowService.getMainWindow()
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    windowService.hideMainWindow()
  })

  ipcMain.handle('window:setSize', (_event, width: number, height: number) => {
    windowService.getMainWindow()?.setSize(width, height)
  })
}
