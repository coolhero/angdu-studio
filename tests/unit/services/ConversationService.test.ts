import { describe, it, expect } from 'vitest'
import { ConversationService } from '../../../src/renderer/src/services/ConversationService'
import type { Message } from '../../../src/renderer/src/types/message'

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: Math.random().toString(36).slice(2),
    role: 'user',
    assistantId: 'a1',
    topicId: 't1',
    createdAt: new Date().toISOString(),
    status: 'success',
    blocks: ['b1'],
    ...overrides,
  }
}

describe('ConversationService', () => {
  describe('filterAfterContextClearMessages', () => {
    it('returns all messages when no clear marker exists', () => {
      const messages = [makeMessage(), makeMessage()]
      const result = ConversationService.filterAfterContextClearMessages(messages)
      expect(result).toHaveLength(2)
    })

    it('returns only messages after the last clear marker', () => {
      const messages = [
        makeMessage(),
        makeMessage({ type: 'clear' }),
        makeMessage({ id: 'after-clear' }),
      ]
      const result = ConversationService.filterAfterContextClearMessages(messages)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('after-clear')
    })
  })

  describe('filterUsefulMessages', () => {
    it('removes messages marked as not useful', () => {
      const messages = [
        makeMessage({ useful: true }),
        makeMessage({ useful: false }),
        makeMessage(), // undefined useful
      ]
      const result = ConversationService.filterUsefulMessages(messages)
      expect(result).toHaveLength(2)
    })
  })

  describe('filterErrorOnlyMessagesWithRelated', () => {
    it('removes error assistant messages and their paired user messages', () => {
      const messages = [
        makeMessage({ role: 'user', askId: 'ask-1' }),
        makeMessage({ role: 'assistant', askId: 'ask-1', status: 'error' }),
        makeMessage({ role: 'user', askId: 'ask-2' }),
        makeMessage({ role: 'assistant', askId: 'ask-2', status: 'success' }),
      ]
      const result = ConversationService.filterErrorOnlyMessagesWithRelated(messages)
      expect(result).toHaveLength(2)
      expect(result.every((m) => m.askId === 'ask-2')).toBe(true)
    })
  })

  describe('filterLastAssistantMessage', () => {
    it('removes trailing assistant message', () => {
      const messages = [
        makeMessage({ role: 'user' }),
        makeMessage({ role: 'assistant' }),
      ]
      const result = ConversationService.filterLastAssistantMessage(messages)
      expect(result).toHaveLength(1)
      expect(result[0].role).toBe('user')
    })

    it('keeps trailing user message', () => {
      const messages = [
        makeMessage({ role: 'assistant' }),
        makeMessage({ role: 'user' }),
      ]
      const result = ConversationService.filterLastAssistantMessage(messages)
      expect(result).toHaveLength(2)
    })
  })

  describe('filterAdjacentUserMessages', () => {
    it('collapses consecutive user messages', () => {
      const messages = [
        makeMessage({ role: 'user', id: 'u1' }),
        makeMessage({ role: 'user', id: 'u2' }),
        makeMessage({ role: 'user', id: 'u3' }),
        makeMessage({ role: 'assistant', id: 'a1' }),
      ]
      const result = ConversationService.filterAdjacentUserMessages(messages)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('u3')
      expect(result[1].id).toBe('a1')
    })
  })

  describe('takeRight', () => {
    it('takes the last N messages', () => {
      const messages = Array.from({ length: 10 }, (_, i) => makeMessage({ id: `m${i}` }))
      const result = ConversationService.takeRight(messages, 3)
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('m7')
    })

    it('returns all if N > length', () => {
      const messages = [makeMessage(), makeMessage()]
      const result = ConversationService.takeRight(messages, 10)
      expect(result).toHaveLength(2)
    })

    it('returns all for unlimited (-1)', () => {
      const messages = Array.from({ length: 100 }, () => makeMessage())
      const result = ConversationService.takeRight(messages, -1)
      expect(result).toHaveLength(100)
    })
  })

  describe('filterEmptyMessages', () => {
    it('keeps system and user messages regardless of blocks', () => {
      const messages = [
        makeMessage({ role: 'system', blocks: [] }),
        makeMessage({ role: 'user', blocks: [] }),
      ]
      const result = ConversationService.filterEmptyMessages(messages)
      expect(result).toHaveLength(2)
    })

    it('removes assistant messages with empty blocks', () => {
      const messages = [
        makeMessage({ role: 'assistant', blocks: [] }),
        makeMessage({ role: 'assistant', blocks: ['b1'] }),
      ]
      const result = ConversationService.filterEmptyMessages(messages)
      expect(result).toHaveLength(1)
    })
  })

  describe('filterUserRoleStartMessages', () => {
    it('removes leading non-user messages', () => {
      const messages = [
        makeMessage({ role: 'assistant', id: 'a1' }),
        makeMessage({ role: 'user', id: 'u1' }),
        makeMessage({ role: 'assistant', id: 'a2' }),
      ]
      const result = ConversationService.filterUserRoleStartMessages(messages)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('u1')
    })
  })

  describe('filterMessagesPipeline', () => {
    it('returns empty array for empty input', () => {
      expect(ConversationService.filterMessagesPipeline([], 5)).toEqual([])
    })

    it('returns at least last user message as fallback', () => {
      const messages = [
        makeMessage({ role: 'assistant', blocks: [], id: 'a1' }),
        makeMessage({ role: 'user', id: 'u1' }),
        makeMessage({ role: 'assistant', blocks: [], id: 'a2' }),
      ]
      // All assistant messages have empty blocks → removed.
      // Last message removed (assistant trailing). Only user remains after filtering.
      const result = ConversationService.filterMessagesPipeline(messages, 5)
      expect(result.length).toBeGreaterThanOrEqual(1)
      expect(result.some((m) => m.role === 'user')).toBe(true)
    })

    it('applies context window limit', () => {
      const messages: Message[] = []
      for (let i = 0; i < 20; i++) {
        messages.push(makeMessage({ role: i % 2 === 0 ? 'user' : 'assistant', blocks: ['b1'] }))
      }
      const result = ConversationService.filterMessagesPipeline(messages, 5)
      expect(result.length).toBeLessThanOrEqual(7) // contextCount + 2
    })
  })

  describe('getContextCount', () => {
    it('returns settings context count', () => {
      const assistant = {
        id: 'a1',
        name: 'Test',
        prompt: '',
        type: 'default',
        topics: [],
        settings: { contextCount: 10 },
      }
      const messages = Array.from({ length: 20 }, () => makeMessage())
      const { current, max } = ConversationService.getContextCount(assistant as any, messages)
      expect(max).toBe(10)
      expect(current).toBe(10)
    })

    it('returns unlimited for MAX_CONTEXT_COUNT', () => {
      const assistant = {
        id: 'a1',
        name: 'Test',
        prompt: '',
        type: 'default',
        topics: [],
        settings: { contextCount: 100 },
      }
      const messages = Array.from({ length: 50 }, () => makeMessage())
      const { max } = ConversationService.getContextCount(assistant as any, messages)
      expect(max).toBe(50) // unlimited = all messages
    })
  })
})
