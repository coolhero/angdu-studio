// MessagesService — message creation and context helpers (F005)

import { v4 as uuid } from 'uuid'
import type { Assistant, Topic, Message, MessageBlock, MainTextBlock, FileBlock, Model } from '@shared/types'
import type { Provider } from '@shared/types'
import type { FileMetadata } from '@shared/types'
import { CONTEXT_COUNT_UNLIMITED } from '@shared/types'

// Track last message time per provider for rate limiting
const lastMessageTime: Record<string, number> = {}

export function createUserMessage(
  assistant: Assistant,
  topic: Topic,
  content: string,
  files?: FileMetadata[],
  mentions?: Model[]
): { message: Message; blocks: MessageBlock[] } {
  const now = new Date().toISOString()
  const messageId = uuid()
  const blocks: MessageBlock[] = []

  // Create MainText block from content
  if (content) {
    const textBlock: MainTextBlock = {
      id: uuid(),
      messageId,
      type: 'main_text',
      status: 'success',
      content,
      createdAt: now
    }
    blocks.push(textBlock)
  }

  // Create File blocks from files
  if (files) {
    for (const file of files) {
      const fileBlock: FileBlock = {
        id: uuid(),
        messageId,
        type: 'file',
        status: 'success',
        file,
        createdAt: now
      }
      blocks.push(fileBlock)
    }
  }

  const message: Message = {
    id: messageId,
    topicId: topic.id,
    assistantId: assistant.id,
    role: 'user',
    blocks: blocks.map((b) => b.id),
    status: 'success',
    mentions,
    createdAt: now
  }

  return { message, blocks }
}

export function createAssistantMessage(assistant: Assistant, topic: Topic, model: Model): Message {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    topicId: topic.id,
    assistantId: assistant.id,
    role: 'assistant',
    blocks: [],
    modelId: model.id,
    model,
    status: 'pending',
    createdAt: now
  }
}

export function resetAssistantMessage(message: Message): Message {
  return {
    ...message,
    blocks: [],
    status: 'pending',
    updatedAt: new Date().toISOString()
  }
}

export function filterContextMessages(messages: Message[], contextCount: number): Message[] {
  if (contextCount === CONTEXT_COUNT_UNLIMITED) return [...messages]
  if (contextCount <= 0) return []
  return messages.slice(-contextCount)
}

export function getContextCount(
  assistant: Assistant,
  messages: Message[]
): { current: number; max: number } {
  const max = assistant.settings?.contextCount ?? 5
  return {
    current: messages.length,
    max: max === CONTEXT_COUNT_UNLIMITED ? Infinity : max
  }
}

export function checkRateLimit(provider: Provider): { limited: boolean; waitMs: number } {
  if (!provider.rateLimit || provider.rateLimit <= 0) {
    return { limited: false, waitMs: 0 }
  }

  const lastTime = lastMessageTime[provider.id]
  if (!lastTime) {
    return { limited: false, waitMs: 0 }
  }

  const elapsed = Date.now() - lastTime
  const limitMs = provider.rateLimit * 1000

  if (elapsed < limitMs) {
    return { limited: true, waitMs: limitMs - elapsed }
  }

  return { limited: false, waitMs: 0 }
}

export function recordMessageTime(providerId: string): void {
  lastMessageTime[providerId] = Date.now()
}

export function resetRateLimitTracking(): void {
  for (const key of Object.keys(lastMessageTime)) {
    delete lastMessageTime[key]
  }
}
