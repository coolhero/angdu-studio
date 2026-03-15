import { ipcMain, app } from 'electron'

const ALLOWED_PATHS = ['home', 'appData', 'userData', 'temp', 'logs', 'documents', 'downloads'] as const

export function registerAppHandlers(): void {
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })

  ipcMain.handle('app:getPlatform', () => {
    return process.platform as 'darwin' | 'win32' | 'linux'
  })

  ipcMain.handle('app:getPath', (_event, name: string) => {
    if (!ALLOWED_PATHS.includes(name as (typeof ALLOWED_PATHS)[number])) {
      throw new Error(`Path name not allowed: ${name}`)
    }
    return app.getPath(name as (typeof ALLOWED_PATHS)[number])
  })

  ipcMain.handle('app:relaunch', () => {
    app.relaunch()
    app.quit()
  })

  ipcMain.handle('app:quit', () => {
    ;(app as unknown as { isQuitting: boolean }).isQuitting = true
    app.quit()
  })
}
