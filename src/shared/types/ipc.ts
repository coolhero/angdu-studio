import type { AppConfig, ConfigKey } from './config'
import type { WindowState } from './window'
import type { Provider, Model } from './provider'
import type { ChatMessage, ChatOptions, ConnectionTestResult, ModelFetchResult, NormalizedChunk, SerializedError, TokenUsage } from './ai-core'
import type { Message, MessageBlock } from './message'
import type { Topic } from './topic'
import type { Assistant } from './assistant'

// --- Invoke Channels (request/response) ---

export interface InvokeChannelMap {
  // Config
  'config:get': { args: [key: ConfigKey]; return: unknown }
  'config:set': { args: [key: ConfigKey, value: unknown]; return: void }
  'config:reset': { args: []; return: void }
  'config:getAll': { args: []; return: AppConfig }

  // Window
  'window:minimize': { args: []; return: void }
  'window:maximize': { args: []; return: void }
  'window:close': { args: []; return: void }
  'window:setSize': { args: [width: number, height: number]; return: void }

  // File
  'file:read': { args: [relativePath: string]; return: Buffer }
  'file:write': { args: [relativePath: string, data: Buffer]; return: void }
  'file:delete': { args: [relativePath: string]; return: void }

  // Shell
  'shell:openExternal': { args: [url: string]; return: void }
  'shell:openPath': { args: [path: string]; return: void }
  'shell:showItemInFolder': { args: [path: string]; return: void }

  // Dialog
  'dialog:openFile': {
    args: [options?: { filters?: { name: string; extensions: string[] }[]; properties?: string[] }]
    return: string[] | null
  }
  'dialog:saveFile': {
    args: [options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }]
    return: string | null
  }

  // Clipboard
  'clipboard:read': { args: []; return: string }
  'clipboard:write': { args: [text: string]; return: void }
  'clipboard:readImage': { args: []; return: Buffer | null }

  // Theme
  'theme:get': { args: []; return: 'light' | 'dark' }
  'theme:set': { args: [theme: 'light' | 'dark' | 'system']; return: void }

  // App
  'app:getVersion': { args: []; return: string }
  'app:getPlatform': { args: []; return: 'darwin' | 'win32' | 'linux' }
  'app:getPath': {
    args: [name: 'home' | 'appData' | 'userData' | 'temp' | 'logs' | 'documents' | 'downloads']
    return: string
  }
  'app:relaunch': { args: []; return: void }
  'app:quit': { args: []; return: void }

  // Data (F003)
  'data:export': { args: [includeDocs?: boolean]; return: Buffer }
  'data:import': { args: [zipBuffer: ArrayBuffer]; return: void }
  'data:clear': { args: []; return: void }
  'data:getStoragePath': { args: []; return: string }

  // Shortcuts (F003)
  'shortcuts:register': { args: [key: string, accelerator: string]; return: boolean }
  'shortcuts:unregister': { args: [key: string]; return: void }
  'shortcuts:unregisterAll': { args: []; return: void }

  // Startup (F003)
  'startup:setLoginItem': { args: [enabled: boolean]; return: void }

  // Provider (F004)
  'provider:list': { args: []; return: Provider[] }
  'provider:add': { args: [provider: Omit<Provider, 'id' | 'models' | 'isAuthed'>]; return: Provider }
  'provider:update': { args: [id: string, updates: Partial<Provider>]; return: Provider }
  'provider:delete': { args: [id: string]; return: void }
  'provider:test-connection': { args: [id: string]; return: ConnectionTestResult }

  // Model (F004)
  'provider:fetch-models': { args: [providerId: string]; return: ModelFetchResult }
  'provider:add-custom-model': { args: [providerId: string, model: Omit<Model, 'provider'>]; return: Model }

  // AI Core (F004)
  'ai:chat': { args: [providerId: string, modelId: string, messages: ChatMessage[], options: ChatOptions]; return: void }
  'ai:abort': { args: [requestId: string]; return: void }

  // Chat Topics (F005)
  'chat:getTopics': { args: [assistantId: string]; return: Topic[] }
  'chat:createTopic': { args: [assistantId: string, name?: string]; return: Topic }
  'chat:deleteTopic': { args: [topicId: string]; return: void }
  'chat:renameTopic': { args: [topicId: string, name: string]; return: void }

  // Chat Messages (F005)
  'chat:getMessages': { args: [topicId: string, offset?: number, limit?: number]; return: { messages: Message[]; hasMore: boolean } }
  'chat:addMessage': { args: [data: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>]; return: Message }
  'chat:updateMessage': { args: [id: string, updates: Partial<Message>]; return: Message }
  'chat:deleteMessage': { args: [id: string]; return: void }
  'chat:deleteMessagesAfter': { args: [topicId: string, afterMessageId: string]; return: { deletedCount: number } }

  // Chat Blocks (F005)
  'chat:getBlocks': { args: [messageId: string]; return: MessageBlock[] }
  'chat:getBlocksBatch': { args: [messageIds: string[]]; return: Record<string, MessageBlock[]> }
  'chat:addBlock': { args: [data: Omit<MessageBlock, 'id' | 'createdAt' | 'updatedAt'>]; return: MessageBlock }
  'chat:updateBlock': { args: [id: string, updates: Partial<MessageBlock>]; return: MessageBlock }
  'chat:updateBlocksBatch': { args: [blocks: Array<{ id: string; updates: Partial<MessageBlock> }>]; return: void }

  // Topic Naming (F005)
  'chat:generateTopicName': { args: [topicId: string, messages: Array<{ role: string; content: string }>]; return: { name: string } }

  // Assistant (F005)
  'assistant:getAll': { args: []; return: Assistant[] }
  'assistant:add': { args: [data: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>]; return: Assistant }
  'assistant:update': { args: [id: string, updates: Partial<Assistant>]; return: Assistant }
  'assistant:delete': { args: [id: string]; return: void }
  'assistant:import': { args: [data: string]; return: Assistant[] }
  'assistant:export': { args: [ids: string[]]; return: string }
}

// --- Event Channels (main → renderer) ---

export interface EventChannelMap {
  'theme:changed': { payload: 'light' | 'dark' }
  'window:focus': { payload: void }
  'window:blur': { payload: void }
  'window:state-changed': { payload: WindowState }
  'update:available': { payload: { version: string } }
  'update:progress': {
    payload: { percent: number; bytesPerSecond: number; total: number; transferred: number }
  }
  'update:ready': { payload: { version: string } }
  'deep-link:received': { payload: { url: string } }

  // AI Core streaming (F004)
  'ai:stream-chunk': { payload: { requestId: string; chunk: NormalizedChunk } }
  'ai:stream-complete': { payload: { requestId: string; usage?: TokenUsage } }
  'ai:stream-error': { payload: { requestId: string; error: SerializedError } }
}

// --- Type utilities ---

export type InvokeChannel = keyof InvokeChannelMap
export type EventChannel = keyof EventChannelMap

export type InvokeArgs<C extends InvokeChannel> = InvokeChannelMap[C]['args']
export type InvokeReturn<C extends InvokeChannel> = InvokeChannelMap[C]['return']
export type EventPayload<C extends EventChannel> = EventChannelMap[C]['payload']
