import { describe, it, expect, vi } from 'vitest'
import {
  filterContextMessages,
  getContextCount,
  checkRateLimit,
  DEFAULT_CONTEXT_COUNT,
  MAX_CONTEXT_COUNT,
  UNLIMITED_CONTEXT_COUNT,
  type Message
} from '@renderer/services/ContextWindowService'

describe('ContextWindowService', () => {
  describe('filterContextMessages', () => {
    const makeMessages = (count: number): Message[] =>
      Array.from({ length: count }, (_, i) => ({
        role: 'user',
        content: `Message ${i + 1}`
      }))

    it('should use default context count of 5', () => {
      const messages = makeMessages(20)
      const filtered = filterContextMessages(messages, DEFAULT_CONTEXT_COUNT)
      expect(filtered).toHaveLength(5)
      expect(filtered[0].content).toBe('Message 16')
      expect(filtered[4].content).toBe('Message 20')
    })

    it('should respect max context count of 100', () => {
      const messages = makeMessages(200)
      const filtered = filterContextMessages(messages, MAX_CONTEXT_COUNT)
      expect(filtered).toHaveLength(100)
      expect(filtered[0].content).toBe('Message 101')
    })

    it('should send all messages when unlimited', () => {
      const messages = makeMessages(500)
      const filtered = filterContextMessages(messages, UNLIMITED_CONTEXT_COUNT)
      expect(filtered).toHaveLength(500)
    })

    it('should preserve system prompts', () => {
      const messages: Message[] = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'msg1' },
        { role: 'assistant', content: 'resp1' },
        { role: 'user', content: 'msg2' },
        { role: 'assistant', content: 'resp2' },
        { role: 'user', content: 'msg3' },
        { role: 'assistant', content: 'resp3' }
      ]
      const filtered = filterContextMessages(messages, 2)
      expect(filtered).toHaveLength(3) // 1 system + 2 recent
      expect(filtered[0].role).toBe('system')
      // Last 2 conversation messages: user:msg3, assistant:resp3
      expect(filtered[1].content).toBe('msg3')
      expect(filtered[2].content).toBe('resp3')
    })

    it('should return all messages when count exceeds total', () => {
      const messages = makeMessages(3)
      const filtered = filterContextMessages(messages, 10)
      expect(filtered).toHaveLength(3)
    })

    it('should handle empty messages', () => {
      const filtered = filterContextMessages([], 5)
      expect(filtered).toHaveLength(0)
    })
  })

  describe('getContextCount', () => {
    it('should return default count when not configured', () => {
      const result = getContextCount({}, [
        { role: 'user', content: 'a' },
        { role: 'user', content: 'b' }
      ])
      expect(result.max).toBe(DEFAULT_CONTEXT_COUNT)
      expect(result.current).toBe(2) // only 2 messages
    })

    it('should use configured count', () => {
      const result = getContextCount({ contextCount: 10 }, Array.from({ length: 20 }, () => ({ role: 'user', content: 'x' })))
      expect(result.max).toBe(10)
      expect(result.current).toBe(10)
    })
  })

  describe('checkRateLimit', () => {
    it('should block when within rate limit delay', () => {
      const now = Date.now()
      const lastTime = now - 2000 // 2 seconds ago
      vi.spyOn(Date, 'now').mockReturnValue(now)

      const result = checkRateLimit({ rateLimit: 5 }, lastTime)
      expect(result.blocked).toBe(true)
      expect(result.waitSeconds).toBe(3)

      vi.restoreAllMocks()
    })

    it('should allow after delay expires', () => {
      const now = Date.now()
      const lastTime = now - 6000 // 6 seconds ago
      vi.spyOn(Date, 'now').mockReturnValue(now)

      const result = checkRateLimit({ rateLimit: 5 }, lastTime)
      expect(result.blocked).toBe(false)
      expect(result.waitSeconds).toBe(0)

      vi.restoreAllMocks()
    })

    it('should not block when no rate limit configured', () => {
      const result = checkRateLimit({}, Date.now())
      expect(result.blocked).toBe(false)
    })

    it('should not block when rate limit is 0', () => {
      const result = checkRateLimit({ rateLimit: 0 }, Date.now())
      expect(result.blocked).toBe(false)
    })
  })
})
