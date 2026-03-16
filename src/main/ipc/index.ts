import { registerConfigHandlers } from './config'
import { registerWindowHandlers } from './window'
import { registerThemeHandlers } from './theme'
import { registerFileHandlers } from './file'
import { registerShellHandlers } from './shell'
import { registerDialogHandlers } from './dialog'
import { registerClipboardHandlers } from './clipboard'
import { registerAppHandlers } from './app'
import { registerDataHandlers } from './data'
import { registerShortcutHandlers } from './shortcuts'
import { registerStartupHandlers } from './startup'

export function registerAllHandlers(): void {
  registerConfigHandlers()
  registerWindowHandlers()
  registerThemeHandlers()
  registerFileHandlers()
  registerShellHandlers()
  registerDialogHandlers()
  registerClipboardHandlers()
  registerAppHandlers()
  registerDataHandlers()
  registerShortcutHandlers()
  registerStartupHandlers()
}
