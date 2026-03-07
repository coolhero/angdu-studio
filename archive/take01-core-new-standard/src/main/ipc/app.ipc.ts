import { app } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { typedHandle } from './typedHandle'
import type { AppService } from '../services/AppService'

/**
 * Registers app lifecycle IPC handlers.
 */
export function registerAppIpc(_appService: AppService): void {
  typedHandle(IpcChannel.AppGetInfo, async () => ({
    name: app.getName(),
    version: app.getVersion(),
    electronVersion: process.versions.electron
  }))

  typedHandle(IpcChannel.AppQuit, async () => {
    app.quit()
  })

  typedHandle(IpcChannel.AppRelaunch, async () => {
    app.relaunch()
    app.quit()
  })

  typedHandle(IpcChannel.AppSetLanguage, async (_event, language) => {
    // Persist the language preference via config service
    _appService.setLanguage(language)
  })
}
