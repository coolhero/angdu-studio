import { ipcMain, shell } from 'electron'

export function registerShellHandlers(): void {
  ipcMain.handle('shell:openExternal', (_event, url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL must use http:// or https:// scheme')
    }
    return shell.openExternal(url)
  })

  ipcMain.handle('shell:openPath', (_event, filePath: string) => {
    return shell.openPath(filePath)
  })

  ipcMain.handle('shell:showItemInFolder', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })
}
