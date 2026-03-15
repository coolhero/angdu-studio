import { ipcMain, dialog, BrowserWindow } from 'electron'

export function registerDialogHandlers(): void {
  ipcMain.handle('dialog:openFile', (event, options?: Electron.OpenDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return dialog.showOpenDialog(win, options ?? {}).then((result) =>
      result.canceled ? null : result.filePaths
    )
  })

  ipcMain.handle('dialog:saveFile', (event, options?: Electron.SaveDialogOptions) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return null
    return dialog.showSaveDialog(win, options ?? {}).then((result) =>
      result.canceled ? null : result.filePath ?? null
    )
  })
}
