import { ipcMain, BrowserWindow } from 'electron'
import { KnowledgeService } from '../services/KnowledgeService'
import { ProviderService } from '../services/ProviderService'
import type {
  KnowledgeBase,
  ItemType,
  VectorRecord
} from '@shared/types/knowledge'
import type { Model } from '@shared/types/provider'

export function registerKnowledgeHandlers(): void {
  const knowledgeService = KnowledgeService.getInstance()

  // --- KB CRUD ---

  ipcMain.handle(
    'kb:create',
    (
      _event,
      params: {
        name: string
        model: KnowledgeBase['model']
        dimensions?: number
        documentCount?: number
        chunkSize?: number
        chunkOverlap?: number
        threshold?: number
      }
    ) => {
      return knowledgeService.create(params)
    }
  )

  ipcMain.handle('kb:delete', (_event, id: string) => {
    return knowledgeService.delete(id)
  })

  ipcMain.handle('kb:reset', (_event, id: string) => {
    knowledgeService.reset(id)
  })

  ipcMain.handle(
    'kb:update',
    (_event, kb: Partial<KnowledgeBase> & { id: string }) => {
      return knowledgeService.update(kb)
    }
  )

  ipcMain.handle('kb:list', () => {
    return knowledgeService.list()
  })

  // --- Item Management ---

  ipcMain.handle(
    'kb:addItem',
    (
      _event,
      baseId: string,
      type: ItemType,
      content: string,
      remark?: string
    ) => {
      return knowledgeService.addItem(baseId, type, content, remark)
    }
  )

  ipcMain.handle(
    'kb:removeItem',
    (_event, baseId: string, itemId: string) => {
      knowledgeService.removeItem(baseId, itemId)
    }
  )

  ipcMain.handle('kb:addFiles', (_event, baseId: string, files: string[]) => {
    return knowledgeService.addFiles(baseId, files)
  })

  ipcMain.handle(
    'kb:retryItem',
    (_event, baseId: string, itemId: string) => {
      knowledgeService.retryItem(baseId, itemId)
    }
  )

  // --- Search ---

  ipcMain.handle(
    'kb:search',
    (
      _event,
      kbIds: string[],
      query: string,
      limit?: number,
      threshold?: number
    ) => {
      return knowledgeService.search(kbIds, query, limit, threshold)
    }
  )

  ipcMain.handle(
    'kb:rerank',
    (
      _event,
      results: Array<VectorRecord & { similarity: number }>,
      query: string,
      rerankModel?: Model
    ) => {
      return knowledgeService.rerank(results, query, rerankModel)
    }
  )

  ipcMain.handle(
    'kb:saveContent',
    (
      _event,
      targetKBId: string,
      content: string,
      type: ItemType,
      remark?: string
    ) => {
      return knowledgeService.saveContent(targetKBId, content, type, remark)
    }
  )

  ipcMain.handle('kb:closeAll', () => {
    knowledgeService.closeAll()
  })

  // --- Embedding (ai:embed) ---

  ipcMain.handle(
    'ai:embed',
    async (
      _event,
      providerId: string,
      modelId: string,
      texts: string[],
      dimensions?: number
    ): Promise<number[][]> => {
      const providerService = ProviderService.getInstance()
      const provider = providerService.getProviderWithKey(providerId)
      if (!provider) throw new Error(`Provider not found: ${providerId}`)

      const apiKey = providerService.decryptKey(provider.apiKey)
      const baseURL = getEmbeddingBaseURL(provider)

      const { createOpenAI } = await import('@ai-sdk/openai')
      const { embedMany } = await import('ai')

      const openai = createOpenAI({ apiKey, baseURL })
      const embeddingModel = openai.embedding(modelId, { dimensions })

      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: texts
      })

      return embeddings
    }
  )
}

function getEmbeddingBaseURL(provider: {
  type: string
  apiHost: string
}): string {
  const url = provider.apiHost.replace(/\/+$/, '')
  const { URL_TRANSFORM_RULES } = require('@shared/types/provider')
  const transform = URL_TRANSFORM_RULES[provider.type]
  const transformed: string = transform ? transform(url) : url

  if (
    (provider.type === 'openai' ||
      provider.type === 'new-api' ||
      provider.type === 'gateway') &&
    !transformed.endsWith('/v1') &&
    !transformed.includes('/v1/')
  ) {
    return `${transformed}/v1`
  }
  return transformed
}
