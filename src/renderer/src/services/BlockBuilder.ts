import { nanoid } from 'nanoid'
import type { NormalizedChunk, ChunkType } from '@shared/types/ai-core'
import type { MessageBlock, BlockType } from '@shared/types/message'

const CHUNK_TO_BLOCK_TYPE: Record<ChunkType, BlockType> = {
  text: 'main_text',
  thinking: 'thinking',
  'tool-call': 'tool',
  'tool-result': 'tool',
  error: 'error'
}

interface StreamState {
  currentBlockId: string | null
  currentType: ChunkType | null
  sortOrder: number
  thinkingStartTime: number | null
}

const streamStates = new Map<string, StreamState>()

/** Initialize stream state for a new message */
export function initStream(messageId: string): void {
  streamStates.set(messageId, {
    currentBlockId: null,
    currentType: null,
    sortOrder: 0,
    thinkingStartTime: null
  })
}

/** Clean up stream state */
export function cleanupStream(messageId: string): void {
  streamStates.delete(messageId)
}

/**
 * Process a chunk and return block operations.
 * Returns { block, isNew } — isNew=true means a new block was created.
 */
export function processChunk(
  messageId: string,
  chunk: NormalizedChunk,
  existingBlocks: MessageBlock[]
): { block: MessageBlock; isNew: boolean } | null {
  let state = streamStates.get(messageId)
  if (!state) {
    initStream(messageId)
    state = streamStates.get(messageId)!
  }

  const blockType = CHUNK_TO_BLOCK_TYPE[chunk.type]
  if (!blockType) return null

  // Check if we need a new block (type changed or no current block)
  const needsNewBlock = state.currentType !== chunk.type || state.currentBlockId === null

  if (needsNewBlock) {
    // Finalize thinking block timing if switching away from thinking
    if (state.currentType === 'thinking' && state.thinkingStartTime && state.currentBlockId) {
      const thinkingMs = Date.now() - state.thinkingStartTime
      const thinkingBlock = existingBlocks.find((b) => b.id === state!.currentBlockId)
      if (thinkingBlock && thinkingBlock.type === 'thinking') {
        thinkingBlock.content.thinkingMs = thinkingMs
      }
      state.thinkingStartTime = null
    }

    const now = new Date().toISOString()
    const blockId = nanoid(21)
    state.currentBlockId = blockId
    state.currentType = chunk.type
    state.sortOrder++

    if (chunk.type === 'thinking') {
      state.thinkingStartTime = Date.now()
    }

    const newBlock = createBlock(blockId, messageId, blockType, chunk, state.sortOrder, now)
    return { block: newBlock, isNew: true }
  }

  // Append to existing block
  const existing = existingBlocks.find((b) => b.id === state!.currentBlockId)
  if (!existing) return null

  const updatedContent = appendContent(existing, chunk)
  return {
    block: { ...existing, content: updatedContent } as MessageBlock,
    isNew: false
  }
}

function createBlock(
  id: string,
  messageId: string,
  blockType: BlockType,
  chunk: NormalizedChunk,
  sortOrder: number,
  now: string
): MessageBlock {
  const base = {
    id,
    messageId,
    status: 'streaming' as const,
    sortOrder,
    createdAt: now,
    updatedAt: now
  }

  switch (blockType) {
    case 'main_text':
      return { ...base, type: 'main_text', content: { text: chunk.content } }
    case 'thinking':
      return { ...base, type: 'thinking', content: { text: chunk.content, collapsed: false } }
    case 'tool':
      return {
        ...base,
        type: 'tool',
        content: {
          toolCallId: chunk.toolCallId ?? '',
          toolName: chunk.toolName ?? '',
          args: chunk.toolArgs ?? {},
          status: chunk.type === 'tool-result' ? 'done' : 'calling'
        }
      }
    case 'error':
      return {
        ...base,
        type: 'error',
        content: {
          code: 'STREAM_ERROR',
          message: chunk.content,
          retryable: true
        }
      }
    default:
      return { ...base, type: 'unknown', content: { raw: chunk.content } }
  }
}

function appendContent(block: MessageBlock, chunk: NormalizedChunk): MessageBlock['content'] {
  switch (block.type) {
    case 'main_text':
      return { text: block.content.text + chunk.content }
    case 'thinking':
      return { ...block.content, text: block.content.text + chunk.content }
    case 'tool':
      if (chunk.type === 'tool-result') {
        return { ...block.content, result: chunk.content, status: 'done' as const }
      }
      return block.content
    default:
      return block.content
  }
}
