import { ipcMain, BrowserWindow } from 'electron'
import { ProviderService } from '../services/ProviderService'
import { ModelService } from '../services/ModelService'
import { AICoreService } from '../services/AICoreService'
import type { Provider, Model } from '@shared/types/provider'
import type { ChatMessage, ChatOptions } from '@shared/types/ai-core'

export function registerProviderHandlers(): void {
  const providerService = ProviderService.getInstance()
  const modelService = ModelService.getInstance()
  const aiCoreService = AICoreService.getInstance()

  // Provider CRUD
  ipcMain.handle('provider:list', () => {
    return providerService.getProviders()
  })

  ipcMain.handle(
    'provider:add',
    (_event, data: Omit<Provider, 'id' | 'models' | 'isAuthed'>) => {
      return providerService.addProvider(data)
    }
  )

  ipcMain.handle(
    'provider:update',
    (_event, id: string, updates: Partial<Provider>) => {
      return providerService.updateProvider(id, updates)
    }
  )

  ipcMain.handle('provider:delete', (_event, id: string) => {
    providerService.deleteProvider(id)
  })

  ipcMain.handle('provider:test-connection', (_event, id: string) => {
    return providerService.testConnection(id)
  })

  // Model operations
  ipcMain.handle('provider:fetch-models', (_event, providerId: string) => {
    return modelService.fetchModels(providerId)
  })

  ipcMain.handle(
    'provider:add-custom-model',
    (_event, providerId: string, model: Omit<Model, 'provider'>) => {
      return providerService.addCustomModel(providerId, model)
    }
  )

  // AI Core
  ipcMain.handle(
    'ai:chat',
    (event, providerId: string, modelId: string, messages: ChatMessage[], options: ChatOptions) => {
      const provider = providerService.getProviderWithKey(providerId)
      if (!provider) throw new Error(`Provider not found: ${providerId}`)

      const model = provider.models.find((m) => m.id === modelId)
      if (!model) throw new Error(`Model not found: ${modelId}`)

      const apiKey = providerService.decryptKey(provider.apiKey)
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) throw new Error('No browser window found')

      // Fire and forget — streaming is handled via events
      aiCoreService.chat(provider, apiKey, model, messages, options, window)
    }
  )

  ipcMain.handle('ai:abort', (_event, requestId: string) => {
    aiCoreService.abort(requestId)
  })
}
