// --- Model Reference ---

export interface ModelReference {
  providerId: string
  modelId: string
  displayName?: string
}

// --- Assistant Settings ---

export interface AssistantSettings {
  temperature: number // 0-2, default 0.7
  topP: number // 0-1, default 1
  maxTokens: number // 0 = model default
  contextCount: number // how many messages to include in context window, default 20
  streamOutput: boolean // default true
  reasoning_effort?: 'low' | 'medium' | 'high'
}

// --- Assistant ---

export interface Assistant {
  id: string
  name: string
  emoji?: string
  description?: string
  prompt: string
  topics: string[]
  model?: ModelReference
  settings: AssistantSettings
  tags?: string[]
  category?: string
  mcpMode?: 'auto' | 'manual' | 'off'
  mcpServers?: string[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

// --- Default Assistant ---

export const DEFAULT_ASSISTANT: Assistant = {
  id: 'default',
  name: 'Default Assistant',
  emoji: undefined,
  prompt: 'You are a helpful assistant.',
  topics: [],
  settings: {
    temperature: 0.7,
    topP: 1,
    maxTokens: 0,
    contextCount: 20,
    streamOutput: true
  },
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// --- Draft ---

export interface DraftContent {
  text: string
  plainText: string
  attachments: DraftAttachment[]
  updatedAt: string
}

export interface DraftAttachment {
  id: string
  type: 'image' | 'file'
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  previewUrl?: string
}
