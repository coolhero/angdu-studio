import { ipcMain } from 'electron'
import { shortcutService } from '../services/ShortcutService'

export function registerShortcutHandlers(): void {
  ipcMain.handle('shortcuts:register', (_event, key: string, accelerator: string) => {
    return shortcutService.registerKeyed(key, accelerator)
  })

  ipcMain.handle('shortcuts:unregister', (_event, key: string) => {
    shortcutService.unregisterKeyed(key)
  })

  ipcMain.handle('shortcuts:unregisterAll', () => {
    shortcutService.unregisterAllKeyed()
  })
}
