import { create } from 'zustand'
import { broadcastSync } from './middleware/broadcastSync'
import { db } from '../lib/db'

import type { Message, MessageBlock, BlockType } from '@shared/types'

// ── Store Interface ──

interface MessageStoreState {
  // ── State ──
  messagesByTopic: Record<string, string[]>
  entities: Record<string, Message>
  blockEntities: Record<string, MessageBlock>
  currentTopicId: string | null
  loadingByTopic: Record<string, boolean>
  displayCount: number

  // ── Actions ──
  loadTopicMessages: (topicId: string) => Promise<void>
  addMessage: (topicId: string, message: Message) => void
  updateMessage: (topicId: string, messageId: string, updates: Partial<Message>) => void
  removeMessage: (topicId: string, messageId: string) => void
  removeMessages: (topicId: string, messageIds: string[]) => void
  upsertBlock: (block: MessageBlock) => void
  upsertBlocks: (blocks: MessageBlock[]) => void
  removeBlock: (blockId: string) => void
  removeBlocks: (blockIds: string[]) => void
  upsertBlockReference: (messageId: string, blockId: string, blockType: BlockType) => void
  clearTopicMessages: (topicId: string) => void

  // ── Selectors ──
  getMessagesForTopic: (topicId: string) => Message[]
  getMessage: (id: string) => Message | undefined
  getBlock: (id: string) => MessageBlock | undefined
  getBlocksForMessage: (messageId: string) => MessageBlock[]
}

// ── Store ──

export const useMessageStore = create<MessageStoreState>()(
  broadcastSync(
    (set, get) => ({
      // ── State ──
      messagesByTopic: {},
      entities: {},
      blockEntities: {},
      currentTopicId: null,
      loadingByTopic: {},
      displayCount: 20,

      // ── Actions ──

      loadTopicMessages: async (topicId) => {
        set((state) => ({
          loadingByTopic: { ...state.loadingByTopic, [topicId]: true }
        }))

        try {
          const messages = await db.messages.where('topicId').equals(topicId).toArray()
          const blocks = await db.message_blocks
            .where('messageId')
            .anyOf(messages.map((m) => m.id))
            .toArray()

          const entities: Record<string, Message> = {}
          for (const message of messages) {
            entities[message.id] = message
          }

          const blockEntities: Record<string, MessageBlock> = {}
          for (const block of blocks) {
            blockEntities[block.id] = block
          }

          set((state) => ({
            entities: { ...state.entities, ...entities },
            blockEntities: { ...state.blockEntities, ...blockEntities },
            messagesByTopic: {
              ...state.messagesByTopic,
              [topicId]: messages.map((m) => m.id)
            },
            loadingByTopic: { ...state.loadingByTopic, [topicId]: false }
          }))
        } catch {
          set((state) => ({
            loadingByTopic: { ...state.loadingByTopic, [topicId]: false }
          }))
        }
      },

      addMessage: (topicId, message) =>
        set((state) => {
          const existing = state.messagesByTopic[topicId] ?? []
          return {
            entities: { ...state.entities, [message.id]: message },
            messagesByTopic: { ...state.messagesByTopic, [topicId]: [...existing, message.id] }
          }
        }),

      updateMessage: (topicId, messageId, updates) =>
        set((state) => {
          const message = state.entities[messageId]
          if (!message) return state
          return {
            entities: {
              ...state.entities,
              [messageId]: { ...message, ...updates }
            }
          }
        }),

      removeMessage: (topicId, messageId) =>
        set((state) => {
          const message = state.entities[messageId]
          const { [messageId]: _removed, ...remaining } = state.entities
          const ids = (state.messagesByTopic[topicId] ?? []).filter((id) => id !== messageId)
          // Also remove associated blocks
          const blockEntities = { ...state.blockEntities }
          if (message) {
            for (const blockId of message.blocks) {
              delete blockEntities[blockId]
            }
          }
          return {
            entities: remaining,
            blockEntities,
            messagesByTopic: { ...state.messagesByTopic, [topicId]: ids }
          }
        }),

      removeMessages: (topicId, messageIds) =>
        set((state) => {
          const messageIdSet = new Set(messageIds)
          const remaining: Record<string, Message> = {}
          for (const [id, msg] of Object.entries(state.entities)) {
            if (!messageIdSet.has(id)) remaining[id] = msg
          }
          const ids = (state.messagesByTopic[topicId] ?? []).filter((id) => !messageIdSet.has(id))
          return {
            entities: remaining,
            messagesByTopic: { ...state.messagesByTopic, [topicId]: ids }
          }
        }),

      upsertBlock: (block) =>
        set((state) => ({
          blockEntities: { ...state.blockEntities, [block.id]: block }
        })),

      upsertBlocks: (blocks) =>
        set((state) => {
          const updates: Record<string, MessageBlock> = {}
          for (const block of blocks) {
            updates[block.id] = block
          }
          return { blockEntities: { ...state.blockEntities, ...updates } }
        }),

      removeBlock: (blockId) =>
        set((state) => {
          const { [blockId]: _removed, ...remaining } = state.blockEntities
          return { blockEntities: remaining }
        }),

      removeBlocks: (blockIds) =>
        set((state) => {
          const blockIdSet = new Set(blockIds)
          const remaining: Record<string, MessageBlock> = {}
          for (const [id, block] of Object.entries(state.blockEntities)) {
            if (!blockIdSet.has(id)) remaining[id] = block
          }
          return { blockEntities: remaining }
        }),

      upsertBlockReference: (messageId, blockId, blockType) =>
        set((state) => {
          const message = state.entities[messageId]
          if (!message) return state
          const blocks = [...message.blocks]
          if (blocks.includes(blockId)) return state
          if (blockType === 'thinking') {
            // Thinking blocks go before non-thinking blocks (prepend to start)
            blocks.unshift(blockId)
          } else {
            blocks.push(blockId)
          }
          return {
            entities: { ...state.entities, [messageId]: { ...message, blocks } }
          }
        }),

      clearTopicMessages: (topicId) =>
        set((state) => {
          const messageIds = new Set(state.messagesByTopic[topicId] ?? [])
          const entities: Record<string, Message> = {}
          const blockIdsToRemove = new Set<string>()
          for (const [id, msg] of Object.entries(state.entities)) {
            if (messageIds.has(id)) {
              for (const blockId of msg.blocks) blockIdsToRemove.add(blockId)
            } else {
              entities[id] = msg
            }
          }
          const blockEntities: Record<string, MessageBlock> = {}
          for (const [id, block] of Object.entries(state.blockEntities)) {
            if (!blockIdsToRemove.has(id)) blockEntities[id] = block
          }
          const { [topicId]: _removed, ...messagesByTopic } = state.messagesByTopic
          return { entities, blockEntities, messagesByTopic }
        }),

      // ── Selectors ──

      getMessagesForTopic: (topicId) => {
        const state = get()
        const ids = state.messagesByTopic[topicId] ?? []
        return ids.map((id) => state.entities[id]).filter((m): m is Message => m !== undefined)
      },

      getMessage: (id) => get().entities[id],

      getBlock: (id) => get().blockEntities[id],

      getBlocksForMessage: (messageId) => {
        const state = get()
        const message = state.entities[messageId]
        if (!message) return []
        return message.blocks
          .map((id) => state.blockEntities[id])
          .filter((b): b is MessageBlock => b !== undefined)
      }
    }),
    'cherry-studio-message'
  )
)
