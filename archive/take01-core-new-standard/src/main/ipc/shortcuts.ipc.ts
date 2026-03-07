import { IpcChannel } from '@shared/IpcChannel'
import { typedHandle } from './typedHandle'
import type { ShortcutService } from '../services/ShortcutService'

/**
 * Registers keyboard shortcut IPC handlers.
 */
export function registerShortcutsIpc(shortcutService: ShortcutService): void {
  typedHandle(IpcChannel.ShortcutRegister, async (_event, shortcut) => {
    return shortcutService.register(shortcut, () => {
      // Callback is handled on the main process side.
      // Renderer is notified via events if needed.
    })
  })

  typedHandle(IpcChannel.ShortcutUnregister, async (_event, id) => {
    shortcutService.unregister(id)
  })

  typedHandle(IpcChannel.ShortcutGetAll, async () => {
    return shortcutService.getAll()
  })
}
