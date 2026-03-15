import { ipcMain, clipboard } from 'electron'

export function registerClipboardHandlers(): void {
  ipcMain.handle('clipboard:read', () => {
    return clipboard.readText()
  })

  ipcMain.handle('clipboard:write', (_event, text: string) => {
    clipboard.writeText(text)
  })

  ipcMain.handle('clipboard:readImage', () => {
    const image = clipboard.readImage()
    if (image.isEmpty()) return null
    return image.toPNG()
  })
}
