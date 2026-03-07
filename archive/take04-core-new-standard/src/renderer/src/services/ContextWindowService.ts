// Context Window Service (F003)

export const DEFAULT_CONTEXT_COUNT = 5
export const MAX_CONTEXT_COUNT = 100
export const UNLIMITED_CONTEXT_COUNT = 100000

export interface Message {
  role: string
  content: string
  [key: string]: unknown
}

export interface Assistant {
  contextCount?: number
  [key: string]: unknown
}

export interface Provider {
  rateLimit?: number
  [key: string]: unknown
}

/**
 * Filters messages based on context window size.
 * Always preserves system messages at the beginning.
 */
export function filterContextMessages(messages: Message[], contextCount: number): Message[] {
  if (!messages || messages.length === 0) return []

  const effectiveCount = Math.max(1, Math.min(contextCount, UNLIMITED_CONTEXT_COUNT))

  // Separate system messages from conversation messages
  const systemMessages = messages.filter((m) => m.role === 'system')
  const conversationMessages = messages.filter((m) => m.role !== 'system')

  if (effectiveCount >= conversationMessages.length) {
    return messages
  }

  // Take the most recent N conversation messages
  const recentMessages = conversationMessages.slice(-effectiveCount)

  return [...systemMessages, ...recentMessages]
}

/**
 * Gets the current context count configuration.
 */
export function getContextCount(assistant: Assistant, messages: Message[]): { current: number; max: number } {
  const contextCount = assistant.contextCount ?? DEFAULT_CONTEXT_COUNT
  const conversationMessages = messages.filter((m) => m.role !== 'system')
  const effectiveCount = Math.min(conversationMessages.length, contextCount)

  return {
    current: effectiveCount,
    max: contextCount
  }
}

/**
 * Checks if a request is within rate limits.
 */
export function checkRateLimit(provider: Provider, lastMessageTime: number): { blocked: boolean; waitSeconds: number } {
  if (!provider.rateLimit || provider.rateLimit <= 0) {
    return { blocked: false, waitSeconds: 0 }
  }

  const now = Date.now()
  const elapsedMs = now - lastMessageTime
  const limitMs = provider.rateLimit * 1000

  if (elapsedMs < limitMs) {
    const waitMs = limitMs - elapsedMs
    return {
      blocked: true,
      waitSeconds: Math.ceil(waitMs / 1000)
    }
  }

  return { blocked: false, waitSeconds: 0 }
}
