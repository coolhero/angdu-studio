// --- Chat Message ---
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | ContentPart[]
}

export interface ContentPart {
  type: 'text' | 'image'
  text?: string
  image?: string // base64 or URL
}

// --- Chat Options ---
export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
  tools?: ToolDefinition[]
  requestId: string
  providerOptions?: Record<string, unknown>
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

// --- Normalized Chunk (streamed response) ---
export type ChunkType = 'text' | 'thinking' | 'tool-call' | 'tool-result' | 'error'

export interface NormalizedChunk {
  type: ChunkType
  content: string
  toolCallId?: string
  toolName?: string
  toolArgs?: Record<string, unknown>
  thinkingMs?: number
}

// --- Usage ---
export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

// --- Serialized Error ---
export interface SerializedError {
  code: string
  message: string
  provider?: string
  statusCode?: number
  retryAfter?: number
}

// --- Connection Test Result ---
export interface ConnectionTestResult {
  success: boolean
  error?: string
  latency?: number
}

// --- Model Fetch Result ---
export interface ModelFetchResult {
  models: import('./provider').Model[]
  cached: boolean
}
