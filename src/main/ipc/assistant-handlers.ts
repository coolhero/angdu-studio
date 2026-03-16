import { ipcMain } from 'electron'
import { AssistantService } from '../services/AssistantService'
import type { Assistant } from '@shared/types/assistant'

export function registerAssistantHandlers(): void {
  const assistantService = AssistantService.getInstance()

  ipcMain.handle('assistant:getAll', () => {
    return assistantService.getAll()
  })

  ipcMain.handle(
    'assistant:add',
    (_event, data: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>) => {
      return assistantService.add(data)
    }
  )

  ipcMain.handle(
    'assistant:update',
    (_event, id: string, updates: Partial<Assistant>) => {
      return assistantService.update(id, updates)
    }
  )

  ipcMain.handle('assistant:delete', (_event, id: string) => {
    assistantService.delete(id)
  })

  ipcMain.handle('assistant:import', (_event, data: string) => {
    return assistantService.importAssistants(data)
  })

  ipcMain.handle('assistant:export', (_event, ids: string[]) => {
    return assistantService.exportAssistants(ids)
  })
}
