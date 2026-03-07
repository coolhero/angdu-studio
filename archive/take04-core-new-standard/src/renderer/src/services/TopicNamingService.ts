// TopicNamingService — auto-rename topics based on conversation content (F005)

import { db } from '../lib/db'
import { useAssistantStore } from '../stores/useAssistantStore'
import { useRuntimeStore } from '../stores/useRuntimeStore'
import type { Assistant, Message, MessageBlock, MainTextBlock } from '@shared/types'

// ── Naming lock: prevent concurrent renames for the same topic ──

const namingLocks = new Set<string>()

// ── Name generation ──

function generateNameFromMessages(messages: Message[], blockEntities: Record<string, MessageBlock>): string | null {
  // Find the first user message
  const firstUserMessage = messages.find((m) => m.role === 'user')
  if (!firstUserMessage) return null

  // Extract text content from its blocks
  const text = firstUserMessage.blocks
    .map((bid) => blockEntities[bid])
    .filter((b): b is MessageBlock => b != null)
    .filter((b) => b.type === 'main_text')
    .map((b) => (b as MainTextBlock).content)
    .join(' ')
    .trim()

  if (!text) return null

  // Take first 50 chars and trim to last word boundary if truncated
  if (text.length <= 50) return text

  const truncated = text.slice(0, 50)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated
}

// ── Public API ──

/**
 * Auto-rename a topic based on conversation content.
 * Skips if topic.isNameManuallyEdited is true.
 * Uses a per-topic lock to prevent concurrent renames.
 */
export async function autoRenameTopic(
  topicId: string,
  messages: Message[],
  assistant: Assistant,
  blockEntities: Record<string, MessageBlock> = {}
): Promise<void> {
  // Resolve topic from store
  const topic = useAssistantStore.getState().getTopicsForAssistant(assistant.id).find((t) => t.id === topicId)
  if (!topic) return

  // Skip if manually edited
  if (topic.isNameManuallyEdited) return

  // Skip if a rename is already in progress for this topic
  if (namingLocks.has(topicId)) return
  namingLocks.add(topicId)

  const { addRenamingTopic, removeRenamingTopic } = useRuntimeStore.getState()
  addRenamingTopic(topicId)

  try {
    const name = generateNameFromMessages(messages, blockEntities)
    if (!name) return

    const now = new Date().toISOString()
    const updatedTopic = { ...topic, name, updatedAt: now }

    // Update store
    useAssistantStore.getState().updateTopic(assistant.id, { id: topicId, name, updatedAt: now })

    // Persist to Dexie
    await db.topics.put(updatedTopic)
  } finally {
    namingLocks.delete(topicId)
    removeRenamingTopic(topicId)
  }
}
