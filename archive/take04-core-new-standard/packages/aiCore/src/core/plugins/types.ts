// Plugin System Types (F003)

import type { Experimental_LanguageModelV1Middleware as LanguageModelMiddleware } from 'ai'
import type { ProviderId, AiSdkModel } from '../../types'

// ── Request Metadata ──

export interface AiRequestMetadata {
  topicId?: string
  callType?: string
  enableReasoning?: boolean
  enableWebSearch?: boolean
  enableGenerateImage?: boolean
  isPromptToolUse?: boolean
  isSupportedToolUse?: boolean
  custom?: Record<string, unknown>
}

// ── Request Context ──

export interface AiRequestContext<TParams = unknown> {
  providerId: ProviderId
  model: AiSdkModel
  originalParams: TParams
  metadata: AiRequestMetadata
  startTime: number
  requestId: string
  recursiveCall: <T>(params: unknown) => Promise<T>
  isRecursiveCall: boolean
  recursiveDepth: number
  maxRecursiveDepth: number
  mcpTools?: Record<string, unknown>
  extensions: Map<string, unknown>
  middlewares: LanguageModelMiddleware[]
}

// ── Tool Set type ──

export type ToolSet = Record<string, unknown>

// ── Plugin Interface ──

export interface AiPlugin<TParams = unknown, TResult = unknown> {
  name: string
  enforce?: 'pre' | 'post'

  // First-wins hooks
  resolveModel?(modelId: string, context: AiRequestContext<TParams>): Promise<AiSdkModel | null> | AiSdkModel | null
  loadTemplate?(name: string, context: AiRequestContext<TParams>): unknown | null | Promise<unknown | null>

  // Sequential hooks
  configureContext?(context: AiRequestContext<TParams>): void | Promise<void>
  transformParams?(params: TParams, context: AiRequestContext<TParams>): Partial<TParams> | Promise<Partial<TParams>>
  transformResult?(result: TResult, context: AiRequestContext<TParams>): TResult | Promise<TResult>

  // Parallel hooks
  onRequestStart?(context: AiRequestContext<TParams>): void | Promise<void>
  onRequestEnd?(context: AiRequestContext<TParams>, result: TResult): void | Promise<void>
  onError?(error: Error, context: AiRequestContext<TParams>): void | Promise<void>

  // Stream processing
  transformStream?(params: TParams, context: AiRequestContext<TParams>): TransformStream
}
