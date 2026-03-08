import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMessageBlockStore } from '../../../src/renderer/src/stores/useMessageBlockStore'
import { MessageBlockType, MessageBlockStatus } from '../../../src/renderer/src/types/message-block'
import type { MainTextMessageBlock, ThinkingMessageBlock } from '../../../src/renderer/src/types/message-block'

// Mock Dexie
vi.mock('../../../src/renderer/src/databases/ChatDatabase', () => ({
  chatDb: {
    messageBlocks: {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: vi.fn().mockResolvedValue(0),
          toArray: vi.fn().mockResolvedValue([]),
        }),
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}))

describe('useMessageBlockStore', () => {
  beforeEach(() => {
    useMessageBlockStore.setState({ blocks: {} })
  })

  describe('Block CRUD', () => {
    it('adds a block', () => {
      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.PENDING,
        content: 'Hello',
      }

      useMessageBlockStore.getState().addBlock(block)
      expect(useMessageBlockStore.getState().getBlock('block-1')).toBeDefined()
      expect((useMessageBlockStore.getState().getBlock('block-1') as MainTextMessageBlock).content).toBe('Hello')
    })

    it('updates a block', () => {
      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.PENDING,
        content: 'Original',
      }

      useMessageBlockStore.getState().addBlock(block)
      useMessageBlockStore.getState().updateBlock('block-1', { content: 'Updated' })

      const updated = useMessageBlockStore.getState().getBlock('block-1') as MainTextMessageBlock
      expect(updated.content).toBe('Updated')
      expect(updated.updatedAt).toBeDefined()
    })

    it('removes a block', () => {
      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.PENDING,
        content: '',
      }

      useMessageBlockStore.getState().addBlock(block)
      useMessageBlockStore.getState().removeBlock('block-1')
      expect(useMessageBlockStore.getState().getBlock('block-1')).toBeUndefined()
    })

    it('removes blocks by message id', () => {
      useMessageBlockStore.getState().addBlock({
        id: 'b1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.SUCCESS,
        content: 'A',
      } as MainTextMessageBlock)
      useMessageBlockStore.getState().addBlock({
        id: 'b2',
        messageId: 'msg-1',
        type: MessageBlockType.THINKING,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.SUCCESS,
        content: 'B',
        thinking_millsec: 100,
      } as ThinkingMessageBlock)
      useMessageBlockStore.getState().addBlock({
        id: 'b3',
        messageId: 'msg-2',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.SUCCESS,
        content: 'C',
      } as MainTextMessageBlock)

      useMessageBlockStore.getState().removeBlocksByMessageId('msg-1')

      expect(useMessageBlockStore.getState().getBlock('b1')).toBeUndefined()
      expect(useMessageBlockStore.getState().getBlock('b2')).toBeUndefined()
      expect(useMessageBlockStore.getState().getBlock('b3')).toBeDefined()
    })

    it('gets blocks for message', () => {
      useMessageBlockStore.getState().addBlock({
        id: 'b1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.SUCCESS,
        content: '',
      } as MainTextMessageBlock)
      useMessageBlockStore.getState().addBlock({
        id: 'b2',
        messageId: 'msg-1',
        type: MessageBlockType.THINKING,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.SUCCESS,
        content: '',
        thinking_millsec: 0,
      } as ThinkingMessageBlock)

      const blocks = useMessageBlockStore.getState().getBlocksForMessage('msg-1')
      expect(blocks).toHaveLength(2)
    })
  })

  describe('Status Transitions', () => {
    it('allows valid transitions: PENDING → PROCESSING → STREAMING → SUCCESS', () => {
      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.PENDING,
        content: '',
      }
      useMessageBlockStore.getState().addBlock(block)

      expect(useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.PROCESSING)).toBe(true)
      expect(useMessageBlockStore.getState().getBlock('block-1')?.status).toBe(MessageBlockStatus.PROCESSING)

      expect(useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.STREAMING)).toBe(true)
      expect(useMessageBlockStore.getState().getBlock('block-1')?.status).toBe(MessageBlockStatus.STREAMING)

      expect(useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.SUCCESS)).toBe(true)
      expect(useMessageBlockStore.getState().getBlock('block-1')?.status).toBe(MessageBlockStatus.SUCCESS)
    })

    it('rejects invalid transition: PENDING → STREAMING', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.PENDING,
        content: '',
      }
      useMessageBlockStore.getState().addBlock(block)

      const result = useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.STREAMING)

      expect(result).toBe(false)
      expect(useMessageBlockStore.getState().getBlock('block-1')?.status).toBe(MessageBlockStatus.PENDING)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid status transition'),
      )

      consoleSpy.mockRestore()
    })

    it('rejects transition from terminal state: SUCCESS → STREAMING', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.SUCCESS,
        content: '',
      }
      useMessageBlockStore.getState().addBlock(block)

      const result = useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.STREAMING)

      expect(result).toBe(false)
      expect(useMessageBlockStore.getState().getBlock('block-1')?.status).toBe(MessageBlockStatus.SUCCESS)

      consoleSpy.mockRestore()
    })

    it('allows STREAMING → PAUSED → STREAMING', () => {
      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.PENDING,
        content: '',
      }
      useMessageBlockStore.getState().addBlock(block)

      useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.PROCESSING)
      useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.STREAMING)
      expect(useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.PAUSED)).toBe(true)
      expect(useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.STREAMING)).toBe(true)
    })

    it('allows PROCESSING → ERROR', () => {
      const block: MainTextMessageBlock = {
        id: 'block-1',
        messageId: 'msg-1',
        type: MessageBlockType.MAIN_TEXT,
        createdAt: new Date().toISOString(),
        status: MessageBlockStatus.PENDING,
        content: '',
      }
      useMessageBlockStore.getState().addBlock(block)

      useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.PROCESSING)
      expect(useMessageBlockStore.getState().transitionStatus('block-1', MessageBlockStatus.ERROR)).toBe(true)
      expect(useMessageBlockStore.getState().getBlock('block-1')?.status).toBe(MessageBlockStatus.ERROR)
    })

    it('returns false for non-existent block', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = useMessageBlockStore.getState().transitionStatus('non-existent', MessageBlockStatus.PROCESSING)
      expect(result).toBe(false)

      consoleSpy.mockRestore()
    })
  })
})
