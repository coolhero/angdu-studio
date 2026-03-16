import type { Provider, Model } from '@shared/types/provider'
import type { ChatMessage, ChatOptions, ConnectionTestResult, ModelFetchResult } from '@shared/types/ai-core'

const { invoke } = window.api

export const providerClient = {
  list: () => invoke['provider:list'](),
  add: (data: Omit<Provider, 'id' | 'models' | 'isAuthed'>) => invoke['provider:add'](data),
  update: (id: string, updates: Partial<Provider>) => invoke['provider:update'](id, updates),
  delete: (id: string) => invoke['provider:delete'](id),
  testConnection: (id: string) => invoke['provider:test-connection'](id) as Promise<ConnectionTestResult>,
  fetchModels: (providerId: string) => invoke['provider:fetch-models'](providerId) as Promise<ModelFetchResult>,
  addCustomModel: (providerId: string, model: Omit<Model, 'provider'>) =>
    invoke['provider:add-custom-model'](providerId, model),
  chat: (providerId: string, modelId: string, messages: ChatMessage[], options: ChatOptions) =>
    invoke['ai:chat'](providerId, modelId, messages, options),
  abort: (requestId: string) => invoke['ai:abort'](requestId)
}
