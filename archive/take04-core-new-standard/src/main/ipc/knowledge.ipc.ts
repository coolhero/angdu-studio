import { knowledgeService } from '../services/KnowledgeService'
import { withContext } from '../logger'

const log = withContext('ipc:knowledge')

export function registerKnowledgeHandlers(): void {
  knowledgeService.registerHandlers()
  log.debug('Knowledge IPC handlers registered')
}
