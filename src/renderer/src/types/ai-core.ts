import type { Provider, Model } from './provider'

// ── Plugin Lifecycle Hooks ──

export interface PluginContext {
  provider: Provider
  model: Model
  abortSignal?: AbortSignal
  [key: string]: unknown
}

export interface PluginHooks {
  configureContext?: (ctx: PluginContext) => PluginContext
  onRequestStart?: (ctx: PluginContext) => void | Promise<void>
  transformParams?: (params: AICoreParams, ctx: PluginContext) => AICoreParams
  onRequestEnd?: (result: AICoreResult, ctx: PluginContext) => void | Promise<void>
}

export interface PluginDefinition {
  name: string
  enforce?: 'pre' | 'post'
  hooks: PluginHooks
}

// ── AI Core Parameters ──

export interface AICoreParams {
  model: string
  messages: AICoreMessage[]
  temperature?: number
  topK?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  maxTokens?: number
  stopSequences?: string[]
  seed?: number
  tools?: AICoreTool[]
  headers?: Record<string, string>
  providerOptions?: Record<string, unknown>
  abortSignal?: AbortSignal
}

// ── AI Core Messages ──

export interface AICoreMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | AICoreMessagePart[]
}

export interface AICoreMessagePart {
  type: 'text' | 'image' | 'tool-call' | 'tool-result'
  text?: string
  image?: string | Uint8Array
  mimeType?: string
  toolCallId?: string
  toolName?: string
  args?: Record<string, unknown>
  result?: unknown
}

// ── AI Core Tools ──

export interface AICoreTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

// ── AI Core Result ──

export interface AICoreResult {
  text: string
  blocks: MessageBlock[]
  usage?: TokenUsage
  finishReason?: string
}

// ── Message Blocks ──

export type MessageBlock =
  | TextBlock
  | ThinkingBlock
  | ToolCallBlock
  | ToolResultBlock

export interface TextBlock {
  type: 'text'
  content: string
}

export interface ThinkingBlock {
  type: 'thinking'
  content: string
}

export interface ToolCallBlock {
  type: 'tool-call'
  toolCallId: string
  toolName: string
  args: Record<string, unknown>
}

export interface ToolResultBlock {
  type: 'tool-result'
  toolCallId: string
  result: unknown
}

// ── Token Usage ──

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cachedInputTokens?: number
}

// ── Chunk Types ──

export type StreamChunkType =
  | 'text-delta'
  | 'reasoning-delta'
  | 'tool-call'
  | 'tool-result'
  | 'usage'
  | 'finish'
  | 'error'

export interface StreamChunk {
  type: StreamChunkType
  content?: string
  toolCallId?: string
  toolName?: string
  args?: Record<string, unknown>
  result?: unknown
  usage?: TokenUsage
  finishReason?: string
  error?: string
}

// ── Streaming Callback ──

export type OnChunkCallback = (chunk: StreamChunk) => void
