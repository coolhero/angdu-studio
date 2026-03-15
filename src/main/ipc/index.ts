import { registerConfigHandlers } from './config'
import { registerWindowHandlers } from './window'
import { registerThemeHandlers } from './theme'
import { registerFileHandlers } from './file'
import { registerShellHandlers } from './shell'
import { registerDialogHandlers } from './dialog'
import { registerClipboardHandlers } from './clipboard'
import { registerAppHandlers } from './app'

export function registerAllHandlers(): void {
  registerConfigHandlers()
  registerWindowHandlers()
  registerThemeHandlers()
  registerFileHandlers()
  registerShellHandlers()
  registerDialogHandlers()
  registerClipboardHandlers()
  registerAppHandlers()
}
