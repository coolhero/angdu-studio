import { nanoid } from 'nanoid'
import { eq, and, gt, desc, asc, sql, inArray } from 'drizzle-orm'
import { getDb } from '../db'
import { topics } from '../db/schema/topics'
import { messages } from '../db/schema/messages'
import { messageBlocks } from '../db/schema/blocks'
import type { Topic } from '@shared/types/topic'
import type { Message, MessageBlock } from '@shared/types/message'
import { logger } from './LoggerService'

export class ChatService {
  private static instance: ChatService

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  // --- Topic CRUD ---

  getTopics(assistantId: string): Topic[] {
    if (!assistantId) {
      throw Object.assign(new Error('assistantId is required'), {
        code: 'INVALID_ASSISTANT'
      })
    }

    const db = getDb()
    const rows = db
      .select()
      .from(topics)
      .where(eq(topics.assistantId, assistantId))
      .orderBy(desc(topics.updatedAt))
      .all()

    return rows.map(this.rowToTopic)
  }

  createTopic(assistantId: string, name?: string): Topic {
    const db = getDb()
    const now = new Date().toISOString()
    const id = nanoid(21)

    const row = {
      id,
      assistantId,
      name: name ?? 'New Topic',
      type: 'normal' as const,
      pinned: false,
      isNameManuallyEdited: false,
      messageCount: 0,
      createdAt: now,
      updatedAt: now
    }

    db.insert(topics).values(row).run()
    logger.info(`[ChatService] Created topic ${id}`)
    return row
  }

  deleteTopic(topicId: string): void {
    const db = getDb()
    const existing = db.select().from(topics).where(eq(topics.id, topicId)).get()
    if (!existing) {
      throw Object.assign(new Error(`Topic not found: ${topicId}`), {
        code: 'NOT_FOUND'
      })
    }

    // FK cascade will delete messages and blocks
    db.delete(topics).where(eq(topics.id, topicId)).run()
    logger.info(`[ChatService] Deleted topic ${topicId}`)
  }

  renameTopic(topicId: string, name: string): void {
    if (!name || name.length > 200) {
      throw Object.assign(
        new Error('Topic name must be non-empty and <= 200 characters'),
        { code: 'VALIDATION' }
      )
    }

    const db = getDb()
    const existing = db.select().from(topics).where(eq(topics.id, topicId)).get()
    if (!existing) {
      throw Object.assign(new Error(`Topic not found: ${topicId}`), {
        code: 'NOT_FOUND'
      })
    }

    db.update(topics)
      .set({
        name,
        isNameManuallyEdited: true,
        updatedAt: new Date().toISOString()
      })
      .where(eq(topics.id, topicId))
      .run()
  }

  updateTopicName(topicId: string, name: string): void {
    const db = getDb()
    db.update(topics)
      .set({
        name,
        updatedAt: new Date().toISOString()
      })
      .where(eq(topics.id, topicId))
      .run()
  }

  reassignTopics(fromAssistantId: string, toAssistantId: string): void {
    const db = getDb()
    db.update(topics)
      .set({
        assistantId: toAssistantId,
        updatedAt: new Date().toISOString()
      })
      .where(eq(topics.assistantId, fromAssistantId))
      .run()
    logger.info(
      `[ChatService] Reassigned topics from assistant ${fromAssistantId} to ${toAssistantId}`
    )
  }

  // --- Message CRUD ---

  getMessages(
    topicId: string,
    offset = 0,
    limit = 50
  ): { messages: Message[]; hasMore: boolean } {
    const db = getDb()

    // Get total count for hasMore
    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.topicId, topicId))
      .get()
    const totalCount = countResult?.count ?? 0

    const rows = db
      .select()
      .from(messages)
      .where(eq(messages.topicId, topicId))
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset)
      .all()

    return {
      messages: rows.map(this.rowToMessage),
      hasMore: offset + limit < totalCount
    }
  }

  addMessage(data: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Message {
    const db = getDb()

    // Validate topic exists
    const topic = db.select().from(topics).where(eq(topics.id, data.topicId)).get()
    if (!topic) {
      throw Object.assign(new Error(`Topic not found: ${data.topicId}`), {
        code: 'INVALID_TOPIC'
      })
    }

    const now = new Date().toISOString()
    const id = nanoid(21)

    const row = {
      id,
      topicId: data.topicId,
      assistantId: data.assistantId,
      role: data.role,
      status: data.status,
      modelId: data.modelId ?? null,
      providerId: data.providerId ?? null,
      type: data.type,
      mentions: data.mentions ?? null,
      multiModelMessageStyle: data.multiModelMessageStyle ?? null,
      promptTokens: data.usage?.promptTokens ?? null,
      completionTokens: data.usage?.completionTokens ?? null,
      totalTokens: data.usage?.totalTokens ?? null,
      firstTokenLatency: data.metrics?.firstTokenLatency ?? null,
      totalDuration: data.metrics?.totalDuration ?? null,
      createdAt: now,
      updatedAt: now
    }

    db.insert(messages).values(row).run()

    // Increment topic messageCount
    db.update(topics)
      .set({
        messageCount: sql`${topics.messageCount} + 1`,
        updatedAt: now
      })
      .where(eq(topics.id, data.topicId))
      .run()

    return this.rowToMessage({ ...row })
  }

  updateMessage(id: string, updates: Partial<Message>): Message {
    const db = getDb()

    const existing = db.select().from(messages).where(eq(messages.id, id)).get()
    if (!existing) {
      throw Object.assign(new Error(`Message not found: ${id}`), {
        code: 'NOT_FOUND'
      })
    }

    const now = new Date().toISOString()
    const setValues: Record<string, unknown> = { updatedAt: now }

    if (updates.status !== undefined) setValues.status = updates.status
    if (updates.modelId !== undefined) setValues.modelId = updates.modelId
    if (updates.providerId !== undefined) setValues.providerId = updates.providerId
    if (updates.type !== undefined) setValues.type = updates.type
    if (updates.mentions !== undefined) setValues.mentions = updates.mentions
    if (updates.multiModelMessageStyle !== undefined)
      setValues.multiModelMessageStyle = updates.multiModelMessageStyle
    if (updates.usage) {
      if (updates.usage.promptTokens !== undefined)
        setValues.promptTokens = updates.usage.promptTokens
      if (updates.usage.completionTokens !== undefined)
        setValues.completionTokens = updates.usage.completionTokens
      if (updates.usage.totalTokens !== undefined)
        setValues.totalTokens = updates.usage.totalTokens
    }
    if (updates.metrics) {
      if (updates.metrics.firstTokenLatency !== undefined)
        setValues.firstTokenLatency = updates.metrics.firstTokenLatency
      if (updates.metrics.totalDuration !== undefined)
        setValues.totalDuration = updates.metrics.totalDuration
    }

    db.update(messages).set(setValues).where(eq(messages.id, id)).run()

    const updated = db.select().from(messages).where(eq(messages.id, id)).get()!
    return this.rowToMessage(updated)
  }

  deleteMessage(id: string): void {
    const db = getDb()

    const existing = db.select().from(messages).where(eq(messages.id, id)).get()
    if (!existing) {
      throw Object.assign(new Error(`Message not found: ${id}`), {
        code: 'NOT_FOUND'
      })
    }

    // FK cascade will delete blocks
    db.delete(messages).where(eq(messages.id, id)).run()

    // Decrement topic messageCount
    db.update(topics)
      .set({
        messageCount: sql`MAX(${topics.messageCount} - 1, 0)`,
        updatedAt: new Date().toISOString()
      })
      .where(eq(topics.id, existing.topicId))
      .run()
  }

  deleteMessagesAfter(topicId: string, afterMessageId: string): { deletedCount: number } {
    const db = getDb()

    const targetMsg = db.select().from(messages).where(eq(messages.id, afterMessageId)).get()
    if (!targetMsg) {
      throw Object.assign(new Error(`Message not found: ${afterMessageId}`), {
        code: 'NOT_FOUND'
      })
    }

    // Find messages created after the target message in the same topic
    const toDelete = db
      .select({ id: messages.id })
      .from(messages)
      .where(
        and(
          eq(messages.topicId, topicId),
          gt(messages.createdAt, targetMsg.createdAt)
        )
      )
      .all()

    if (toDelete.length === 0) {
      return { deletedCount: 0 }
    }

    const ids = toDelete.map((r) => r.id)
    // FK cascade will delete blocks
    db.delete(messages)
      .where(inArray(messages.id, ids))
      .run()

    // Update topic messageCount
    db.update(topics)
      .set({
        messageCount: sql`MAX(${topics.messageCount} - ${toDelete.length}, 0)`,
        updatedAt: new Date().toISOString()
      })
      .where(eq(topics.id, topicId))
      .run()

    return { deletedCount: toDelete.length }
  }

  // --- Block CRUD ---

  getBlocks(messageId: string): MessageBlock[] {
    const db = getDb()
    const rows = db
      .select()
      .from(messageBlocks)
      .where(eq(messageBlocks.messageId, messageId))
      .orderBy(asc(messageBlocks.sortOrder))
      .all()

    return rows.map(this.rowToBlock)
  }

  getBlocksBatch(messageIds: string[]): Record<string, MessageBlock[]> {
    if (messageIds.length === 0) return {}

    const db = getDb()
    const rows = db
      .select()
      .from(messageBlocks)
      .where(inArray(messageBlocks.messageId, messageIds))
      .orderBy(asc(messageBlocks.sortOrder))
      .all()

    const result: Record<string, MessageBlock[]> = {}
    for (const msgId of messageIds) {
      result[msgId] = []
    }
    for (const row of rows) {
      const block = this.rowToBlock(row)
      if (!result[block.messageId]) {
        result[block.messageId] = []
      }
      result[block.messageId].push(block)
    }

    return result
  }

  addBlock(data: Omit<MessageBlock, 'id' | 'createdAt' | 'updatedAt'>): MessageBlock {
    const db = getDb()
    const now = new Date().toISOString()
    const id = nanoid(21)

    const row = {
      id,
      messageId: data.messageId,
      type: data.type,
      status: data.status,
      content: data.content as Record<string, unknown>,
      sortOrder: data.sortOrder,
      createdAt: now,
      updatedAt: now
    }

    db.insert(messageBlocks).values(row).run()

    return {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    } as MessageBlock
  }

  updateBlock(id: string, updates: Partial<MessageBlock>): MessageBlock {
    const db = getDb()
    const now = new Date().toISOString()

    const setValues: Record<string, unknown> = { updatedAt: now }
    if (updates.status !== undefined) setValues.status = updates.status
    if (updates.content !== undefined) setValues.content = updates.content
    if (updates.sortOrder !== undefined) setValues.sortOrder = updates.sortOrder

    db.update(messageBlocks).set(setValues).where(eq(messageBlocks.id, id)).run()

    const updated = db
      .select()
      .from(messageBlocks)
      .where(eq(messageBlocks.id, id))
      .get()!
    return this.rowToBlock(updated)
  }

  updateBlocksBatch(blocks: Array<{ id: string; updates: Partial<MessageBlock> }>): void {
    const db = getDb()
    const now = new Date().toISOString()

    // Use Drizzle's transaction for batch update
    db.transaction((tx) => {
      for (const { id, updates } of blocks) {
        const setValues: Record<string, unknown> = { updatedAt: now }
        if (updates.status !== undefined) setValues.status = updates.status
        if (updates.content !== undefined) setValues.content = updates.content
        if (updates.sortOrder !== undefined) setValues.sortOrder = updates.sortOrder

        tx.update(messageBlocks).set(setValues).where(eq(messageBlocks.id, id)).run()
      }
    })
  }

  /**
   * Batch upsert blocks — INSERT new blocks or UPDATE existing ones.
   * Used by flushStreamingBlocks to persist in-memory streaming blocks to DB.
   */
  upsertBlocksBatch(blocks: MessageBlock[]): void {
    if (blocks.length === 0) return
    const db = getDb()

    db.transaction((tx) => {
      for (const block of blocks) {
        const existing = tx
          .select({ id: messageBlocks.id })
          .from(messageBlocks)
          .where(eq(messageBlocks.id, block.id))
          .get()

        if (existing) {
          tx.update(messageBlocks)
            .set({
              content: block.content as Record<string, unknown>,
              status: block.status,
              updatedAt: new Date().toISOString()
            })
            .where(eq(messageBlocks.id, block.id))
            .run()
        } else {
          tx.insert(messageBlocks)
            .values({
              id: block.id,
              messageId: block.messageId,
              type: block.type,
              status: block.status,
              content: block.content as Record<string, unknown>,
              sortOrder: block.sortOrder,
              createdAt: block.createdAt,
              updatedAt: block.updatedAt
            })
            .run()
        }
      }
    })
  }

  // --- Row mappers ---

  private rowToTopic(row: typeof topics.$inferSelect): Topic {
    return {
      id: row.id,
      assistantId: row.assistantId,
      name: row.name,
      type: row.type as 'normal' | 'pinned',
      pinned: row.pinned,
      isNameManuallyEdited: row.isNameManuallyEdited,
      messageCount: row.messageCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }
  }

  private rowToMessage(row: typeof messages.$inferSelect): Message {
    const msg: Message = {
      id: row.id,
      topicId: row.topicId,
      assistantId: row.assistantId,
      role: row.role as Message['role'],
      status: row.status as Message['status'],
      type: row.type as Message['type'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }

    if (row.modelId) msg.modelId = row.modelId
    if (row.providerId) msg.providerId = row.providerId
    if (row.mentions) msg.mentions = row.mentions as string[]
    if (row.multiModelMessageStyle)
      msg.multiModelMessageStyle =
        row.multiModelMessageStyle as Message['multiModelMessageStyle']

    if (row.promptTokens != null || row.completionTokens != null || row.totalTokens != null) {
      msg.usage = {}
      if (row.promptTokens != null) msg.usage.promptTokens = row.promptTokens
      if (row.completionTokens != null) msg.usage.completionTokens = row.completionTokens
      if (row.totalTokens != null) msg.usage.totalTokens = row.totalTokens
    }

    if (row.firstTokenLatency != null || row.totalDuration != null) {
      msg.metrics = {}
      if (row.firstTokenLatency != null) msg.metrics.firstTokenLatency = row.firstTokenLatency
      if (row.totalDuration != null) msg.metrics.totalDuration = row.totalDuration
    }

    return msg
  }

  private rowToBlock(row: typeof messageBlocks.$inferSelect): MessageBlock {
    return {
      id: row.id,
      messageId: row.messageId,
      type: row.type,
      status: row.status,
      content: row.content,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    } as MessageBlock
  }
}
