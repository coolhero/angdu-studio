import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { MessageBlock } from '@shared/types/message'

interface BlockState {
  /** messageId → blocks */
  blocksByMessage: Record<string, MessageBlock[]>
  /** Blocks being streamed (in-memory only, not persisted until flush) */
  streamingBlocks: Map<string, MessageBlock>
}

interface BlockActions {
  loadBlocks: (messageIds: string[]) => Promise<void>
  addBlock: (data: Omit<MessageBlock, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MessageBlock>
  /** In-memory update during streaming — no IPC */
  updateBlockContent: (blockId: string, content: Record<string, unknown>) => void
  /** Mark block as streaming in-memory */
  setStreamingBlock: (blockId: string, block: MessageBlock) => void
  /** Batch-persist all streaming blocks to DB */
  flushStreamingBlocks: () => Promise<void>
  /** Get blocks for a message */
  getBlocksForMessage: (messageId: string) => MessageBlock[]
  /** Clear blocks for a message */
  clearBlocksForMessage: (messageId: string) => void
  /** Clear all blocks */
  clearAll: () => void
}

export const useBlockStore = create<BlockState & BlockActions>((set, get) => ({
  blocksByMessage: {},
  streamingBlocks: new Map(),

  loadBlocks: async (messageIds: string[]) => {
    if (messageIds.length === 0) return
    try {
      const result = await window.api.invoke['chat:getBlocksBatch'](messageIds)
      set((s) => ({
        blocksByMessage: { ...s.blocksByMessage, ...result }
      }))
    } catch (err) {
      console.error('[useBlockStore] Failed to load blocks', err)
    }
  },

  addBlock: async (data) => {
    const block = await window.api.invoke['chat:addBlock'](data as MessageBlock)
    set((s) => {
      const existing = s.blocksByMessage[data.messageId] ?? []
      return {
        blocksByMessage: {
          ...s.blocksByMessage,
          [data.messageId]: [...existing, block]
        }
      }
    })
    return block
  },

  updateBlockContent: (blockId: string, content: Record<string, unknown>) => {
    const { streamingBlocks } = get()
    const block = streamingBlocks.get(blockId)
    if (block) {
      const updated = { ...block, content: { ...block.content, ...content } as MessageBlock['content'] }
      const newMap = new Map(streamingBlocks)
      newMap.set(blockId, updated as MessageBlock)

      // Also update in blocksByMessage for UI rendering
      set((s) => {
        const existing = s.blocksByMessage[block.messageId] ?? []
        return {
          streamingBlocks: newMap,
          blocksByMessage: {
            ...s.blocksByMessage,
            [block.messageId]: existing.map((b) =>
              b.id === blockId ? (updated as MessageBlock) : b
            )
          }
        }
      })
    }
  },

  setStreamingBlock: (blockId: string, block: MessageBlock) => {
    set((s) => {
      const newMap = new Map(s.streamingBlocks)
      newMap.set(blockId, block)
      const existing = s.blocksByMessage[block.messageId] ?? []
      const hasBlock = existing.some((b) => b.id === blockId)
      return {
        streamingBlocks: newMap,
        blocksByMessage: {
          ...s.blocksByMessage,
          [block.messageId]: hasBlock
            ? existing.map((b) => (b.id === blockId ? block : b))
            : [...existing, block]
        }
      }
    })
  },

  flushStreamingBlocks: async () => {
    const { streamingBlocks } = get()
    if (streamingBlocks.size === 0) return

    const blocks: MessageBlock[] = []
    for (const [, block] of streamingBlocks) {
      blocks.push(block)
    }

    try {
      await window.api.invoke['chat:upsertBlocksBatch'](blocks)
    } catch (err) {
      console.error('[useBlockStore] Failed to flush streaming blocks', err)
    }

    set({ streamingBlocks: new Map() })
  },

  getBlocksForMessage: (messageId: string) => {
    return get().blocksByMessage[messageId] ?? []
  },

  clearBlocksForMessage: (messageId: string) => {
    set((s) => {
      const { [messageId]: _, ...rest } = s.blocksByMessage
      return { blocksByMessage: rest }
    })
  },

  clearAll: () => set({ blocksByMessage: {}, streamingBlocks: new Map() })
}))

// Stable selector for blocks of a specific message
export const useBlocksForMessage = (messageId: string) =>
  useBlockStore(useShallow((s) => s.blocksByMessage[messageId] ?? []))
