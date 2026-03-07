// AI Chat Types (F005)

import type { FileMetadata } from './file'
import type { Model } from './provider'
import type { KnowledgeReference } from './knowledge'

// ── Enumerations ──

export type AssistantType = 'default' | 'system' | 'agent' | 'chat'

export type McpMode = 'disabled' | 'auto' | 'manual'

export type TopicType = 'chat' | 'session'

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'pending' | 'processing' | 'searching' | 'success' | 'paused' | 'error'

export type BlockType =
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
  | 'unknown'

export type BlockStatus = 'pending' | 'processing' | 'streaming' | 'success' | 'error' | 'paused'

export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'auto' | 'default'

export type ToolUseMode = 'function' | 'prompt'

export type MultiModelStyle = 'horizontal' | 'vertical' | 'fold' | 'grid'

export const CONTEXT_COUNT_UNLIMITED = -1

// ── Custom Parameters ──

export interface CustomParam {
  key: string
  value: string
}

// ── MCP Server Reference ──

export interface McpServerRef {
  id: string
  name: string
}

// ── Citation References ──

export interface CitationRef {
  url: string
  title?: string
  content?: string
  index?: number
}

export interface WebSearchResponse {
  results: WebSearchResult[]
  provider?: string
}

export interface WebSearchResult {
  title: string
  url: string
  content?: string
}

export interface MemoryRef {
  id: string
  content: string
  score?: number
}

// ── Token Usage & Metrics ──

export interface Usage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

export interface Metrics {
  completion_tokens?: number
  time_completion_millsec?: number
  time_first_token_millsec?: number
}

// ── Provider Metadata ──

export type ProviderMetadata = Record<string, unknown>

// ── Image Metadata ──

export interface ImageMetadata {
  width?: number
  height?: number
  alt?: string
}

// ── AssistantSettings ──

export interface AssistantSettings {
  contextCount?: number
  temperature?: number
  enableTemperature?: boolean
  topP?: number
  enableTopP?: boolean
  maxTokens?: number
  enableMaxTokens?: boolean
  streamOutput?: boolean
  reasoning_effort?: ReasoningEffort
  reasoning_effort_cache?: ReasoningEffort
  qwenThinkMode?: boolean
  toolUseMode?: ToolUseMode
  defaultModel?: Model | null
  customParameters?: CustomParam[]
}

// ── Assistant ──

export interface Assistant {
  id: string
  name: string
  prompt: string
  model: Model | null
  defaultModel: Model | null
  settings: AssistantSettings
  topics: Topic[]
  type: AssistantType
  emoji?: string
  description?: string
  enableWebSearch?: boolean
  webSearchProviderId?: string
  enableUrlContext?: boolean
  enableGenerateImage?: boolean
  enableMemory?: boolean
  mcpMode?: McpMode
  mcpServers?: McpServerRef[]
  knowledgeBaseIds?: string[]
  knowledgeRecognition?: string
  tags?: string[]
  regularPhrases?: QuickPhrase[]
}

// ── Topic ──

export interface Topic {
  id: string
  assistantId: string
  name: string
  type?: TopicType
  pinned: boolean
  isNameManuallyEdited?: boolean
  prompt?: string
  createdAt: string
  updatedAt: string
}

// ── Message ──

export interface Message {
  id: string
  topicId: string
  assistantId: string
  role: MessageRole
  blocks: string[]
  modelId?: string
  model?: Model | null
  status: MessageStatus
  type?: string
  useful?: boolean
  askId?: string
  mentions?: Model[]
  usage?: Usage | null
  metrics?: Metrics | null
  multiModelMessageStyle?: MultiModelStyle
  foldSelected?: boolean
  traceId?: string
  agentSessionId?: string
  providerMetadata?: ProviderMetadata
  createdAt: string
  updatedAt?: string
}

// ── MessageBlock (base) ──

export interface MessageBlockBase {
  id: string
  messageId: string
  type: BlockType
  status: BlockStatus
  createdAt: string
  updatedAt?: string
  model?: Model | null
  metadata?: Record<string, unknown>
  error?: string | null
}

// ── Block Variants ──

export interface MainTextBlock extends MessageBlockBase {
  type: 'main_text'
  content: string
  citations?: CitationRef[]
  knowledgeBaseIds?: string[]
}

export interface ThinkingBlock extends MessageBlockBase {
  type: 'thinking'
  content: string
  thinking_millsec?: number
}

export interface TranslationBlock extends MessageBlockBase {
  type: 'translation'
  content: string
  sourceBlockId?: string
  sourceLanguage?: string
  targetLanguage?: string
}

export interface ImageBlock extends MessageBlockBase {
  type: 'image'
  url?: string | null
  file?: FileMetadata | null
  imageMetadata?: ImageMetadata
}

export interface CodeBlock extends MessageBlockBase {
  type: 'code'
  content: string
  language?: string
}

export interface ToolBlock extends MessageBlockBase {
  type: 'tool'
  toolId?: string
  toolName?: string
  arguments?: string
  rawMcpToolResponse?: unknown
}

export interface FileBlock extends MessageBlockBase {
  type: 'file'
  file?: FileMetadata
}

export interface ErrorBlock extends MessageBlockBase {
  type: 'error'
  error: string
}

export interface CitationBlock extends MessageBlockBase {
  type: 'citation'
  webSearchResults?: WebSearchResponse
  knowledgeReferences?: KnowledgeReference[]
  memoryReferences?: MemoryRef[]
}

export interface VideoBlock extends MessageBlockBase {
  type: 'video'
  url?: string | null
  filePath?: string | null
}

export interface CompactBlock extends MessageBlockBase {
  type: 'compact'
  content: string
  compactedContent?: string
}

export interface UnknownBlock extends MessageBlockBase {
  type: 'unknown'
  content: string
}

// ── MessageBlock Union ──

export type MessageBlock =
  | MainTextBlock
  | ThinkingBlock
  | TranslationBlock
  | ImageBlock
  | CodeBlock
  | ToolBlock
  | FileBlock
  | ErrorBlock
  | CitationBlock
  | VideoBlock
  | CompactBlock
  | UnknownBlock

// ── QuickPhrase ──

export interface QuickPhrase {
  id: string
  title: string
  content: string
  prompt?: string
  enabled: boolean
  sortOrder?: number
}
