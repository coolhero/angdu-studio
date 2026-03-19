import { ipcMain } from 'electron'
import { MemoryService } from '../services/MemoryService'
import type { MemoryConfig } from '@shared/types/knowledge'

export function registerMemoryHandlers(): void {
  const memoryService = MemoryService.getInstance()

  ipcMain.handle(
    'memory:list',
    (_event, userId: string, page?: number, pageSize?: number, search?: string) => {
      return memoryService.list(userId, page, pageSize, search)
    }
  )

  ipcMain.handle(
    'memory:add',
    (_event, userId: string, content: string, metadata?: Record<string, unknown>) => {
      return memoryService.add(userId, content, metadata)
    }
  )

  ipcMain.handle(
    'memory:update',
    (_event, id: string, content: string) => {
      return memoryService.update(id, content)
    }
  )

  ipcMain.handle('memory:delete', (_event, id: string) => {
    memoryService.delete(id)
  })

  ipcMain.handle(
    'memory:search',
    (_event, userId: string, query: string, limit?: number) => {
      return memoryService.search(userId, query, limit)
    }
  )

  ipcMain.handle('memory:get', (_event, id: string) => {
    return memoryService.get(id)
  })

  ipcMain.handle('memory:deleteAllForUser', (_event, userId: string) => {
    memoryService.deleteAllForUser(userId)
  })

  ipcMain.handle('memory:getUsersList', () => {
    return memoryService.getUsersList()
  })

  ipcMain.handle(
    'memory:extractFacts',
    (
      _event,
      userId: string,
      messages: Array<{ role: string; content: string }>,
      config?: MemoryConfig
    ) => {
      return memoryService.extractFacts(userId, messages, config)
    }
  )

  ipcMain.handle(
    'memory:searchRelevant',
    (_event, userId: string, query: string, limit?: number) => {
      return memoryService.searchRelevant(userId, query, limit)
    }
  )

  ipcMain.handle('memory:getConfig', () => {
    return memoryService.getConfig()
  })

  ipcMain.handle(
    'memory:updateConfig',
    (_event, partial: Partial<MemoryConfig>) => {
      return memoryService.updateConfig(partial)
    }
  )
}
