// Plugin helpers (F003)

import { v4 as uuid } from 'uuid'
import type { AiPlugin, AiRequestContext } from './types'
import type { ProviderId, AiSdkModel } from '../../types'

export type { AiPlugin, AiRequestContext, AiRequestMetadata, ToolSet } from './types'
export { PluginManager } from './manager'

// ── definePlugin: type-safe plugin creation ──

export function definePlugin<TParams = unknown, TResult = unknown>(plugin: AiPlugin<TParams, TResult>): AiPlugin<TParams, TResult> {
  return plugin
}

// ── createContext: build a request context ──

export function createContext(
  providerId: ProviderId,
  model: AiSdkModel,
  params: unknown,
  metadata: AiRequestContext['metadata'] = {}
): AiRequestContext {
  const context: AiRequestContext = {
    providerId,
    model,
    originalParams: params,
    metadata,
    startTime: Date.now(),
    requestId: uuid(),
    recursiveCall: async () => {
      throw new Error('recursiveCall not configured')
    },
    isRecursiveCall: false,
    recursiveDepth: 0,
    maxRecursiveDepth: 10,
    extensions: new Map(),
    middlewares: []
  }
  return context
}
