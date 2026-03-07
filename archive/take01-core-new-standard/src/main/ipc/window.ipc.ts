import { BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { typedHandle } from './typedHandle'

/**
 * Registers window management IPC handlers.
 */
export function registerWindowIpc(): void {
  typedHandle(IpcChannel.WindowMinimize, async (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  typedHandle(IpcChannel.WindowMaximize, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  typedHandle(IpcChannel.WindowClose, async (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  typedHandle(IpcChannel.WindowIsMaximized, async (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })
}
