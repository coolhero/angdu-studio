import type { NormalizedChunk, TokenUsage, SerializedError } from '@shared/types/ai-core'

type ChunkHandler = (chunk: NormalizedChunk) => void
type CompleteHandler = (usage?: TokenUsage) => void
type ErrorHandler = (error: SerializedError) => void

interface StreamHandlers {
  onChunk: ChunkHandler
  onComplete: CompleteHandler
  onError: ErrorHandler
}

const activeStreams = new Map<string, StreamHandlers>()
let globalCleanup: (() => void) | null = null

/** Initialize global IPC event listeners. Call once on app startup. */
export function initChatStreamListeners(): () => void {
  if (globalCleanup) return globalCleanup

  const unsubChunk = window.api.events.on('ai:stream-chunk', (payload) => {
    const handlers = activeStreams.get(payload.requestId)
    if (handlers) {
      handlers.onChunk(payload.chunk)
    }
  })

  const unsubComplete = window.api.events.on('ai:stream-complete', (payload) => {
    const handlers = activeStreams.get(payload.requestId)
    if (handlers) {
      handlers.onComplete(payload.usage)
      activeStreams.delete(payload.requestId)
    }
  })

  const unsubError = window.api.events.on('ai:stream-error', (payload) => {
    const handlers = activeStreams.get(payload.requestId)
    if (handlers) {
      handlers.onError(payload.error)
      activeStreams.delete(payload.requestId)
    }
  })

  globalCleanup = () => {
    unsubChunk()
    unsubComplete()
    unsubError()
    activeStreams.clear()
    globalCleanup = null
  }

  return globalCleanup
}

/** Register handlers for a specific request. Returns unregister function. */
export function registerStream(requestId: string, handlers: StreamHandlers): () => void {
  activeStreams.set(requestId, handlers)
  return () => {
    activeStreams.delete(requestId)
  }
}

/** Check if a stream is active */
export function isStreamActive(requestId: string): boolean {
  return activeStreams.has(requestId)
}
