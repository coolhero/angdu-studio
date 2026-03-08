import type {
  StreamChunk,
  OnChunkCallback,
  MessageBlock,
  TokenUsage,
  TextBlock,
  ThinkingBlock,
  ToolCallBlock
} from '../../types/ai-core'

export interface ChunkProcessorState {
  blocks: MessageBlock[]
  usage?: TokenUsage
  finishReason?: string
  currentTextBlock?: TextBlock
  currentThinkingBlock?: ThinkingBlock
}

export function createChunkProcessor(onChunk: OnChunkCallback): {
  process: (chunk: StreamChunk) => void
  getState: () => ChunkProcessorState
} {
  const state: ChunkProcessorState = {
    blocks: []
  }

  function process(chunk: StreamChunk): void {
    switch (chunk.type) {
      case 'text-delta': {
        if (!state.currentTextBlock) {
          state.currentTextBlock = { type: 'text', content: '' }
          state.blocks.push(state.currentTextBlock)
        }
        state.currentTextBlock.content += chunk.content ?? ''
        break
      }

      case 'reasoning-delta': {
        // Finalize any open text block
        state.currentTextBlock = undefined

        if (!state.currentThinkingBlock) {
          state.currentThinkingBlock = { type: 'thinking', content: '' }
          state.blocks.push(state.currentThinkingBlock)
        }
        state.currentThinkingBlock.content += chunk.content ?? ''
        break
      }

      case 'tool-call': {
        state.currentTextBlock = undefined
        state.currentThinkingBlock = undefined

        const toolBlock: ToolCallBlock = {
          type: 'tool-call',
          toolCallId: chunk.toolCallId ?? '',
          toolName: chunk.toolName ?? '',
          args: chunk.args ?? {}
        }
        state.blocks.push(toolBlock)
        break
      }

      case 'tool-result': {
        state.blocks.push({
          type: 'tool-result',
          toolCallId: chunk.toolCallId ?? '',
          result: chunk.result
        })
        break
      }

      case 'usage': {
        if (chunk.usage) {
          state.usage = chunk.usage
        }
        break
      }

      case 'finish': {
        state.currentTextBlock = undefined
        state.currentThinkingBlock = undefined
        state.finishReason = chunk.finishReason
        break
      }

      case 'error': {
        state.currentTextBlock = undefined
        state.currentThinkingBlock = undefined
        break
      }
    }

    onChunk(chunk)
  }

  return {
    process,
    getState: () => ({ ...state })
  }
}
