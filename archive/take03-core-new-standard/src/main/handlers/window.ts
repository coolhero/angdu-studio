import { IpcChannel } from '@shared/IpcChannel'
import type { WindowService } from '../services/WindowService'
import { registerHandlers } from '../ipc'

export function registerWindowHandlers(windowService: WindowService): void {
  registerHandlers([
    [IpcChannel.Window_Minimize, () => windowService.minimize()],
    [IpcChannel.Window_Maximize, () => windowService.maximize()],
    [IpcChannel.Window_Unmaximize, () => windowService.unmaximize()],
    [IpcChannel.Window_Close, () => windowService.close()],
    [IpcChannel.Window_IsMaximized, () => windowService.isMaximized()],
    [IpcChannel.Window_GetSize, () => windowService.getSize()],
    [
      IpcChannel.Window_SetMinimumSize,
      (_event, width: unknown, height: unknown) =>
        windowService.setMinimumSize(width as number, height as number)
    ],
    [IpcChannel.Window_ResetMinimumSize, () => windowService.resetMinimumSize()]
  ])
}
