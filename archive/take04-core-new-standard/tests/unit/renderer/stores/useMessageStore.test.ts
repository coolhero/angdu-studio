import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist and broadcastSync middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn
}))

vi.mock('../../../../src/renderer/src/stores/middleware/broadcastSync', () => ({
  broadcastSync: (fn: any, _name: string) => fn
}))

// Mock Dexie db so loadTopicMessages doesn't hit a real database
const { mockMessagesToArray, mockBlocksToArray } = vi.hoisted(() => ({
  mockMessagesToArray: vi.fn().mockResolvedValue([]),
  mockBlocksToArray: vi.fn().mockResolvedValue([])
}))

vi.mock('../../../../src/renderer/src/lib/db', () => ({
  db: {
    messages: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({ toArray: mockMessagesToArray })
      })
    },
    message_blocks: {
      where: vi.fn().mockReturnValue({
        anyOf: vi.fn().mockReturnValue({ toArray: mockBlocksToArray })
      })
    }
  }
}))

import { useMessageStore } from '../../../../src/renderer/src/stores/useMessageStore'
import type { Message, MessageBlock, MainTextBlock, ThinkingBlock } from '@shared/types'

// ── Factory Helpers ──

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    topicId: 'topic-1',
    assistantId: 'asst-1',
    role: 'user',
    blocks: [],
    status: 'success',
    createdAt: new Date(1000).toISOString(),
    ...overrides
  }
}

function makeMainTextBlock(overrides: Partial<MainTextBlock> = {}): MainTextBlock {
  return {
    id: 'block-1',
    messageId: 'msg-1',
    type: 'main_text',
    content: 'Hello',
    status: 'success',
    createdAt: new Date(1000).toISOString(),
    ...overrides
  }
}

function makeThinkingBlock(overrides: Partial<ThinkingBlock> = {}): ThinkingBlock {
  return {
    id: 'think-1',
    messageId: 'msg-1',
    type: 'thinking',
    content: 'Thinking...',
    status: 'success',
    createdAt: new Date(1000).toISOString(),
    ...overrides
  }
}

// ── Tests ──

describe('useMessageStore', () => {
  beforeEach(() => {
    useMessageStore.setState({
      messagesByTopic: {},
      entities: {},
      blockEntities: {},
      currentTopicId: null,
      loadingByTopic: {},
      displayCount: 20
    })
  })

  // ── loadTopicMessages ──

  describe('loadTopicMessages', () => {
    it('should load messages from db and populate entities and messagesByTopic', async () => {
      const msg = makeMessage({ id: 'msg-db-1', topicId: 'topic-1' })
      const block = makeMainTextBlock({ id: 'blk-db-1', messageId: 'msg-db-1' })

      mockMessagesToArray.mockResolvedValueOnce([msg])
      mockBlocksToArray.mockResolvedValueOnce([block])

      await useMessageStore.getState().loadTopicMessages('topic-1')

      const state = useMessageStore.getState()
      expect(state.entities['msg-db-1']).toBeDefined()
      expect(state.messagesByTopic['topic-1']).toContain('msg-db-1')
      expect(state.blockEntities['blk-db-1']).toBeDefined()
    })
  })

  // ── addMessage ──

  describe('addMessage', () => {
    it('should add a message to entities and append its id to messagesByTopic', () => {
      const msg = makeMessage()
      useMessageStore.getState().addMessage('topic-1', msg)
      const state = useMessageStore.getState()
      expect(state.entities['msg-1']).toEqual(msg)
      expect(state.messagesByTopic['topic-1']).toContain('msg-1')
    })

    it('should append multiple messages in order', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm1' }))
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm2' }))
      expect(useMessageStore.getState().messagesByTopic['topic-1']).toEqual(['m1', 'm2'])
    })
  })

  // ── updateMessage ──

  describe('updateMessage', () => {
    it('should merge partial updates into the correct message', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage())
      useMessageStore.getState().updateMessage('topic-1', 'msg-1', { status: 'error' })
      expect(useMessageStore.getState().entities['msg-1'].status).toBe('error')
    })

    it('should preserve existing fields not in the update', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ role: 'assistant' }))
      useMessageStore.getState().updateMessage('topic-1', 'msg-1', { status: 'success' })
      expect(useMessageStore.getState().entities['msg-1'].role).toBe('assistant')
    })
  })

  // ── removeMessage ──

  describe('removeMessage', () => {
    it('should remove message from entities and messagesByTopic', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage())
      useMessageStore.getState().removeMessage('topic-1', 'msg-1')
      const state = useMessageStore.getState()
      expect(state.entities['msg-1']).toBeUndefined()
      expect(state.messagesByTopic['topic-1'] ?? []).not.toContain('msg-1')
    })

    it('should remove associated blocks when removing a message', () => {
      const msg = makeMessage({ blocks: ['block-1'] })
      useMessageStore.getState().addMessage('topic-1', msg)
      useMessageStore.getState().upsertBlock(makeMainTextBlock())
      useMessageStore.getState().removeMessage('topic-1', 'msg-1')
      expect(useMessageStore.getState().blockEntities['block-1']).toBeUndefined()
    })
  })

  // ── removeMessages ──

  describe('removeMessages', () => {
    it('should batch remove multiple messages', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm1' }))
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm2' }))
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm3' }))
      useMessageStore.getState().removeMessages('topic-1', ['m1', 'm3'])
      const state = useMessageStore.getState()
      expect(state.entities['m1']).toBeUndefined()
      expect(state.entities['m3']).toBeUndefined()
      expect(state.entities['m2']).toBeDefined()
      expect(state.messagesByTopic['topic-1']).toEqual(['m2'])
    })
  })

  // ── upsertBlock / upsertBlocks ──

  describe('upsertBlock', () => {
    it('should add a block to blockEntities', () => {
      useMessageStore.getState().upsertBlock(makeMainTextBlock())
      expect(useMessageStore.getState().blockEntities['block-1']).toBeDefined()
      expect(useMessageStore.getState().blockEntities['block-1'].type).toBe('main_text')
    })

    it('should overwrite an existing block with the same id', () => {
      useMessageStore.getState().upsertBlock(makeMainTextBlock({ content: 'First' }))
      useMessageStore.getState().upsertBlock(makeMainTextBlock({ content: 'Second' }))
      const block = useMessageStore.getState().blockEntities['block-1'] as MainTextBlock
      expect(block.content).toBe('Second')
    })
  })

  describe('upsertBlocks', () => {
    it('should add multiple blocks to blockEntities', () => {
      useMessageStore.getState().upsertBlocks([
        makeMainTextBlock({ id: 'b1' }),
        makeMainTextBlock({ id: 'b2' })
      ])
      const state = useMessageStore.getState()
      expect(state.blockEntities['b1']).toBeDefined()
      expect(state.blockEntities['b2']).toBeDefined()
    })
  })

  // ── removeBlock / removeBlocks ──

  describe('removeBlock', () => {
    it('should remove a single block from blockEntities', () => {
      useMessageStore.getState().upsertBlock(makeMainTextBlock())
      useMessageStore.getState().removeBlock('block-1')
      expect(useMessageStore.getState().blockEntities['block-1']).toBeUndefined()
    })
  })

  describe('removeBlocks', () => {
    it('should batch remove blocks', () => {
      useMessageStore.getState().upsertBlocks([
        makeMainTextBlock({ id: 'b1' }),
        makeMainTextBlock({ id: 'b2' }),
        makeMainTextBlock({ id: 'b3' })
      ])
      useMessageStore.getState().removeBlocks(['b1', 'b3'])
      const state = useMessageStore.getState()
      expect(state.blockEntities['b1']).toBeUndefined()
      expect(state.blockEntities['b3']).toBeUndefined()
      expect(state.blockEntities['b2']).toBeDefined()
    })
  })

  // ── upsertBlockReference ──

  describe('upsertBlockReference', () => {
    it('should append a main_text block id to the message blocks array', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'msg-1', blocks: [] }))
      useMessageStore.getState().upsertBlockReference('msg-1', 'block-text', 'main_text')
      expect(useMessageStore.getState().entities['msg-1'].blocks).toEqual(['block-text'])
    })

    it('should prepend a thinking block id to the message blocks array', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'msg-1', blocks: ['block-text'] }))
      useMessageStore.getState().upsertBlockReference('msg-1', 'block-think', 'thinking')
      const blocks = useMessageStore.getState().entities['msg-1'].blocks
      expect(blocks[0]).toBe('block-think')
      expect(blocks[1]).toBe('block-text')
    })

    it('should not add duplicate block reference for the same block id', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'msg-1', blocks: [] }))
      useMessageStore.getState().upsertBlockReference('msg-1', 'block-text', 'main_text')
      useMessageStore.getState().upsertBlockReference('msg-1', 'block-text', 'main_text')
      expect(useMessageStore.getState().entities['msg-1'].blocks).toHaveLength(1)
    })

    it('should append non-thinking blocks after existing blocks', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'msg-1', blocks: ['b1'] }))
      useMessageStore.getState().upsertBlockReference('msg-1', 'b2', 'main_text')
      const blocks = useMessageStore.getState().entities['msg-1'].blocks
      expect(blocks).toEqual(['b1', 'b2'])
    })
  })

  // ── clearTopicMessages ──

  describe('clearTopicMessages', () => {
    it('should remove all messages and their blocks for the given topic', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm1', blocks: ['b1'] }))
      useMessageStore.getState().upsertBlock(makeMainTextBlock({ id: 'b1', messageId: 'm1' }))
      useMessageStore.getState().clearTopicMessages('topic-1')
      const state = useMessageStore.getState()
      expect(state.messagesByTopic['topic-1'] ?? []).toHaveLength(0)
      expect(state.entities['m1']).toBeUndefined()
      expect(state.blockEntities['b1']).toBeUndefined()
    })

    it('should not affect messages from other topics', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm1' }))
      useMessageStore.getState().addMessage('topic-2', makeMessage({ id: 'm2', topicId: 'topic-2' }))
      useMessageStore.getState().clearTopicMessages('topic-1')
      expect(useMessageStore.getState().entities['m2']).toBeDefined()
    })
  })

  // ── Selectors ──

  describe('getMessagesForTopic', () => {
    it('should return messages in order for the given topic', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm1' }))
      useMessageStore.getState().addMessage('topic-1', makeMessage({ id: 'm2' }))
      const messages = useMessageStore.getState().getMessagesForTopic('topic-1')
      expect(messages).toHaveLength(2)
      expect(messages[0].id).toBe('m1')
      expect(messages[1].id).toBe('m2')
    })

    it('should return an empty array for a topic with no messages', () => {
      expect(useMessageStore.getState().getMessagesForTopic('empty-topic')).toEqual([])
    })
  })

  describe('getMessage', () => {
    it('should return the message with the given id', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage())
      const msg = useMessageStore.getState().getMessage('msg-1')
      expect(msg).toBeDefined()
      expect(msg?.id).toBe('msg-1')
    })

    it('should return undefined for a non-existent message id', () => {
      expect(useMessageStore.getState().getMessage('missing')).toBeUndefined()
    })
  })

  describe('getBlock', () => {
    it('should return the block with the given id', () => {
      useMessageStore.getState().upsertBlock(makeMainTextBlock())
      const block = useMessageStore.getState().getBlock('block-1')
      expect(block).toBeDefined()
      expect(block?.type).toBe('main_text')
    })

    it('should return undefined for a non-existent block id', () => {
      expect(useMessageStore.getState().getBlock('missing')).toBeUndefined()
    })
  })

  describe('getBlocksForMessage', () => {
    it('should return all blocks belonging to the given message', () => {
      const msg = makeMessage({ id: 'msg-1', blocks: ['b1', 'b2'] })
      useMessageStore.getState().addMessage('topic-1', msg)
      useMessageStore.getState().upsertBlock(makeMainTextBlock({ id: 'b1', messageId: 'msg-1' }))
      useMessageStore.getState().upsertBlock(makeMainTextBlock({ id: 'b2', messageId: 'msg-1' }))
      const blocks = useMessageStore.getState().getBlocksForMessage('msg-1')
      expect(blocks).toHaveLength(2)
      expect(blocks.map((b) => b.id)).toContain('b1')
      expect(blocks.map((b) => b.id)).toContain('b2')
    })

    it('should return an empty array for a message with no blocks', () => {
      useMessageStore.getState().addMessage('topic-1', makeMessage())
      expect(useMessageStore.getState().getBlocksForMessage('msg-1')).toEqual([])
    })
  })
})
