import { app, ipcMain } from 'electron'

export function registerStartupHandlers(): void {
  ipcMain.handle('startup:setLoginItem', (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: false
    })
  })
}
