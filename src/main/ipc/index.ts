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
import { registerProviderHandlers } from './provider'
import { registerChatHandlers } from './chat-handlers'
import { registerAssistantHandlers } from './assistant-handlers'

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
  registerProviderHandlers()
  registerChatHandlers()
  registerAssistantHandlers()
}
