import { registerAppHandlers } from './app.ipc'
import { registerWindowHandlers } from './window.ipc'
import { registerSystemHandlers } from './system.ipc'
import { registerConfigHandlers } from './config.ipc'
import { registerFileHandlers } from './file.ipc'
import { registerMiniWindowHandlers } from './miniWindow.ipc'
import { registerUtilityHandlers } from './utility.ipc'
import { registerProviderHandlers } from './provider.ipc'
import { registerKnowledgeHandlers } from './knowledge.ipc'
import { withContext } from '../logger'

const log = withContext('ipc')

export function registerAllHandlers(): void {
  registerAppHandlers()
  registerWindowHandlers()
  registerSystemHandlers()
  registerConfigHandlers()
  registerFileHandlers()
  registerMiniWindowHandlers()
  registerUtilityHandlers()
  registerProviderHandlers()
  registerKnowledgeHandlers()
  log.info('All IPC handlers registered')
}
