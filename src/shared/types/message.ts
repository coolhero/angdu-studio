// --- Message ---

export type MessageStatus = 'pending' | 'sending' | 'streaming' | 'success' | 'error' | 'paused'
export type MessageType = 'text' | 'clear_context' | 'divider'
export type MultiModelMessageStyle = 'horizontal' | 'vertical' | 'fold' | 'grid'

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface MessageMetrics {
  firstTokenLatency?: number // ms
  totalDuration?: number // ms
}

export interface Message {
  id: string
  topicId: string
  assistantId: string
  role: 'user' | 'assistant' | 'system'
  status: MessageStatus
  modelId?: string
  providerId?: string
  type: MessageType
  mentions?: string[]
  multiModelMessageStyle?: MultiModelMessageStyle
  usage?: TokenUsage
  metrics?: MessageMetrics
  createdAt: string
  updatedAt: string
}

// --- MessageBlock ---

export type BlockType =
  | 'unknown'
  | 'main_text'
  | 'thinking'
  | 'translation'
  | 'image'
  | 'code'
  | 'tool'
  | 'file'
  | 'error'
  | 'citation'
  | 'video'
  | 'compact'

export type BlockStatus = 'pending' | 'streaming' | 'success' | 'error'

// Base fields shared by all blocks
interface BlockBase {
  id: string
  messageId: string
  status: BlockStatus
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// --- F005-owned block types (8) ---

export interface UnknownBlock extends BlockBase {
  type: 'unknown'
  content: { raw: string }
}

export interface MainTextBlock extends BlockBase {
  type: 'main_text'
  content: { text: string }
}

export interface ThinkingBlock extends BlockBase {
  type: 'thinking'
  content: {
    text: string
    thinkingMs?: number
    collapsed?: boolean
  }
}

export interface CodeBlock extends BlockBase {
  type: 'code'
  content: {
    code: string
    language: string
    fileName?: string
  }
}

export interface ImageBlock extends BlockBase {
  type: 'image'
  content: {
    url: string
    alt?: string
    width?: number
    height?: number
    mimeType?: string
  }
}

export interface FileBlock extends BlockBase {
  type: 'file'
  content: {
    fileName: string
    filePath: string
    fileSize: number
    mimeType: string
  }
}

export interface ToolBlock extends BlockBase {
  type: 'tool'
  content: {
    toolCallId: string
    toolName: string
    args: Record<string, unknown>
    result?: string
    status: 'calling' | 'done' | 'error'
  }
}

export interface ErrorBlock extends BlockBase {
  type: 'error'
  content: {
    code: string
    message: string
    provider?: string
    statusCode?: number
    retryable: boolean
  }
}

// --- Downstream feature block types ---

export interface TranslationBlock extends BlockBase {
  type: 'translation'
  content: { text: string; sourceLanguage: string; targetLanguage: string }
}

export interface CitationBlock extends BlockBase {
  type: 'citation'
  content: { text: string; source: string; url?: string }
}

export interface VideoBlock extends BlockBase {
  type: 'video'
  content: { url: string; mimeType: string; thumbnailUrl?: string }
}

export interface CompactBlock extends BlockBase {
  type: 'compact'
  content: { summary: string; fullBlocks: string[] }
}

// Discriminated union
export type MessageBlock =
  | UnknownBlock
  | MainTextBlock
  | ThinkingBlock
  | CodeBlock
  | ImageBlock
  | FileBlock
  | ToolBlock
  | ErrorBlock
  | TranslationBlock
  | CitationBlock
  | VideoBlock
  | CompactBlock
