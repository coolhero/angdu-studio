import { ipcMain, app, nativeTheme, screen } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import os from 'os'

export function registerSystemHandlers(): void {
  ipcMain.handle(IpcChannel.System_GetLocale, () => {
    return app.getLocale()
  })

  ipcMain.handle(IpcChannel.System_GetPlatform, () => {
    return process.platform
  })

  ipcMain.handle(IpcChannel.System_GetArch, () => {
    return process.arch
  })

  ipcMain.handle(IpcChannel.System_GetMemory, () => ({
    total: os.totalmem(),
    free: os.freemem()
  }))

  ipcMain.handle(IpcChannel.System_GetCPU, () =>
    os.cpus().map((cpu) => ({
      model: cpu.model,
      speed: cpu.speed
    }))
  )

  ipcMain.handle(IpcChannel.System_GetHostname, () => {
    return os.hostname()
  })

  ipcMain.handle(IpcChannel.System_IsDarkMode, () => {
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle(IpcChannel.System_GetDisplays, () => {
    return screen.getAllDisplays().map((d) => ({
      id: d.id,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      rotation: d.rotation
    }))
  })
}
