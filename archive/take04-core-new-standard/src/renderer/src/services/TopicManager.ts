// TopicManager — utility module for topic lifecycle management (F005)

import { v4 as uuid } from 'uuid'
import { db } from '../lib/db'
import { useAssistantStore } from '../stores/useAssistantStore'
import { useMessageStore } from '../stores/useMessageStore'
import type { Topic } from '@shared/types'

// ── removeTopic ──

/**
 * Remove a topic from the store and delete all associated data from Dexie.
 * Cascade deletes all messages and message blocks for the topic.
 */
export async function removeTopic(assistantId: string, topicId: string): Promise<void> {
  // Remove from store
  useAssistantStore.getState().removeTopic(assistantId, topicId)

  // Clear messages from message store
  useMessageStore.getState().clearTopicMessages(topicId)

  // Cascade delete from Dexie: blocks first, then messages, then topic
  const messages = await db.messages.where('topicId').equals(topicId).toArray()
  const messageIds = messages.map((m) => m.id)

  if (messageIds.length > 0) {
    await db.message_blocks.where('messageId').anyOf(messageIds).delete()
    await db.messages.where('topicId').equals(topicId).delete()
  }

  await db.topics.delete(topicId)
}

// ── clearTopicMessages ──

/**
 * Clear all messages for a topic from the store and delete them from Dexie.
 * The topic itself is retained.
 */
export async function clearTopicMessages(topicId: string): Promise<void> {
  // Clear from message store
  useMessageStore.getState().clearTopicMessages(topicId)

  // Delete from Dexie
  const messages = await db.messages.where('topicId').equals(topicId).toArray()
  const messageIds = messages.map((m) => m.id)

  if (messageIds.length > 0) {
    await db.message_blocks.where('messageId').anyOf(messageIds).delete()
    await db.messages.where('topicId').equals(topicId).delete()
  }
}

// ── createDefaultTopic ──

/**
 * Create a new default topic for the given assistant.
 * Returns the Topic object (does not persist or add to store).
 */
export function createDefaultTopic(assistantId: string): Topic {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    assistantId,
    name: 'New Topic',
    type: 'chat',
    pinned: false,
    isNameManuallyEdited: false,
    createdAt: now,
    updatedAt: now
  }
}
