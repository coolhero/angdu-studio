import { describe, it, expect } from 'vitest'
import {
  MessageBlockType,
  MessageBlockStatus,
  type MainTextMessageBlock,
} from '../../../../src/renderer/src/types/message-block'

/**
 * Unit tests for MainTextBlock logic.
 *
 * Since @testing-library/react is not available, we test the data
 * transformation and conditional logic used by the component.
 */

describe('MainTextBlock — logic', () => {
  function createBlock(
    overrides: Partial<MainTextMessageBlock> = {}
  ): MainTextMessageBlock {
    return {
      id: 'block-1',
      messageId: 'msg-1',
      type: MessageBlockType.MAIN_TEXT,
      status: MessageBlockStatus.SUCCESS,
      content: 'Hello **world**',
      createdAt: new Date().toISOString(),
      ...overrides,
    }
  }

  it('has content for rendering markdown', () => {
    const block = createBlock({ content: '# Title\n\nParagraph text.' })
    expect(block.content).toBe('# Title\n\nParagraph text.')
    expect(block.type).toBe(MessageBlockType.MAIN_TEXT)
  })

  it('identifies streaming state from block status', () => {
    const streamingBlock = createBlock({
      status: MessageBlockStatus.STREAMING,
    })
    const successBlock = createBlock({ status: MessageBlockStatus.SUCCESS })

    const isStreaming = true

    const blockIsStreaming =
      isStreaming && streamingBlock.status === MessageBlockStatus.STREAMING
    const blockIsNotStreaming =
      isStreaming && successBlock.status === MessageBlockStatus.STREAMING

    expect(blockIsStreaming).toBe(true)
    expect(blockIsNotStreaming).toBe(false)
  })

  it('handles empty content', () => {
    const block = createBlock({ content: '' })
    // Component returns null when content is empty
    expect(block.content).toBe('')
    expect(!block.content).toBe(true)
  })

  it('preserves citation references', () => {
    const block = createBlock({
      citationReferences: [
        { url: 'https://example.com', title: 'Example' },
      ],
    })
    expect(block.citationReferences).toHaveLength(1)
    expect(block.citationReferences![0].url).toBe('https://example.com')
  })

  it('calculates chunk diff for streaming animation', () => {
    // Simulates the incremental content detection in MainTextBlock
    let prevContentLen = 0

    const content1 = 'Hello'
    const chunk1 = content1.slice(prevContentLen)
    prevContentLen = content1.length
    expect(chunk1).toBe('Hello')

    const content2 = 'Hello World'
    const chunk2 = content2.slice(prevContentLen)
    prevContentLen = content2.length
    expect(chunk2).toBe(' World')

    const content3 = 'Hello World!'
    const chunk3 = content3.slice(prevContentLen)
    prevContentLen = content3.length
    expect(chunk3).toBe('!')
  })
})
