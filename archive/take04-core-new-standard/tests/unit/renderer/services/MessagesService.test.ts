import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'test-uuid-' + Math.random().toString(36).slice(2, 8)) }))

import {
  createUserMessage,
  createAssistantMessage,
  resetAssistantMessage,
  filterContextMessages,
  getContextCount,
  checkRateLimit,
  recordMessageTime,
  resetRateLimitTracking
} from '../../../../src/renderer/src/services/MessagesService'
import type { Assistant, Topic, Message, Model } from '@shared/types'
import type { Provider } from '@shared/types'
import { CONTEXT_COUNT_UNLIMITED } from '@shared/types'
import type { FileMetadata } from '@shared/types'
import { FileType } from '@shared/types'

// ── Factories ──

function makeAssistant(overrides: Partial<Assistant> = {}): Assistant {
  return {
    id: 'assistant-1',
    name: 'Test Assistant',
    prompt: '',
    model: null,
    defaultModel: null,
    settings: { contextCount: 5, streamOutput: true },
    topics: [],
    type: 'default',
    ...overrides
  }
}

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: 'topic-1',
    assistantId: 'assistant-1',
    name: 'Test Topic',
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function makeModel(overrides: Partial<Model> = {}): Model {
  return {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    ...overrides
  }
}

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'msg-1',
    topicId: 'topic-1',
    assistantId: 'assistant-1',
    role: 'user',
    blocks: [],
    status: 'success',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

function makeProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: 'provider-1',
    name: 'OpenAI',
    type: 'openai',
    apiKey: 'sk-test',
    apiHost: 'https://api.openai.com',
    models: [],
    ...overrides
  }
}

function makeFileMetadata(overrides: Partial<FileMetadata> = {}): FileMetadata {
  return {
    id: 'file-1',
    name: 'test.pdf',
    origin_name: 'test.pdf',
    path: '/tmp/test.pdf',
    size: 1024,
    ext: 'pdf',
    type: FileType.Document,
    created_at: Date.now(),
    ...overrides
  }
}

// ── Tests ──

describe('MessagesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRateLimitTracking()
  })

  describe('createUserMessage', () => {
    it('creates a message with role user and status success', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()

      const { message } = createUserMessage(assistant, topic, 'Hello world')

      expect(message.role).toBe('user')
      expect(message.status).toBe('success')
      expect(message.topicId).toBe(topic.id)
      expect(message.assistantId).toBe(assistant.id)
    })

    it('creates a MainText block from content', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()

      const { message, blocks } = createUserMessage(assistant, topic, 'Hello world')

      expect(blocks).toHaveLength(1)
      expect(blocks[0].type).toBe('main_text')
      expect((blocks[0] as { content: string }).content).toBe('Hello world')
      expect(blocks[0].status).toBe('success')
      expect(message.blocks).toContain(blocks[0].id)
    })

    it('creates no MainText block when content is empty', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()

      const { blocks } = createUserMessage(assistant, topic, '')

      expect(blocks).toHaveLength(0)
    })

    it('creates File blocks from files array', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      const file1 = makeFileMetadata({ id: 'file-1', name: 'a.pdf' })
      const file2 = makeFileMetadata({ id: 'file-2', name: 'b.png', type: FileType.Image })

      const { message, blocks } = createUserMessage(assistant, topic, 'See attachments', [file1, file2])

      const fileBlocks = blocks.filter((b) => b.type === 'file')
      expect(fileBlocks).toHaveLength(2)
      expect(fileBlocks[0].status).toBe('success')
      expect(message.blocks).toHaveLength(3) // 1 text + 2 files
    })

    it('sets mentions when provided', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      const model = makeModel()

      const { message } = createUserMessage(assistant, topic, 'ping', undefined, [model])

      expect(message.mentions).toEqual([model])
    })

    it('does not create File blocks when files is undefined', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()

      const { blocks } = createUserMessage(assistant, topic, 'No files')

      expect(blocks.filter((b) => b.type === 'file')).toHaveLength(0)
    })

    it('links block ids to message.blocks', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      const file = makeFileMetadata()

      const { message, blocks } = createUserMessage(assistant, topic, 'Hello', [file])

      expect(message.blocks).toHaveLength(blocks.length)
      for (const block of blocks) {
        expect(message.blocks).toContain(block.id)
      }
    })
  })

  describe('createAssistantMessage', () => {
    it('creates a message with role assistant and status pending', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      const model = makeModel()

      const message = createAssistantMessage(assistant, topic, model)

      expect(message.role).toBe('assistant')
      expect(message.status).toBe('pending')
    })

    it('creates a message with empty blocks', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      const model = makeModel()

      const message = createAssistantMessage(assistant, topic, model)

      expect(message.blocks).toEqual([])
    })

    it('sets topicId and assistantId correctly', () => {
      const assistant = makeAssistant({ id: 'asst-42' })
      const topic = makeTopic({ id: 'topic-99' })
      const model = makeModel()

      const message = createAssistantMessage(assistant, topic, model)

      expect(message.topicId).toBe('topic-99')
      expect(message.assistantId).toBe('asst-42')
    })

    it('stores the model and modelId', () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      const model = makeModel({ id: 'claude-3-5-sonnet', provider: 'anthropic' })

      const message = createAssistantMessage(assistant, topic, model)

      expect(message.modelId).toBe('claude-3-5-sonnet')
      expect(message.model).toEqual(model)
    })
  })

  describe('resetAssistantMessage', () => {
    it('clears blocks and resets status to pending', () => {
      const original = makeMessage({
        role: 'assistant',
        blocks: ['block-1', 'block-2'],
        status: 'success'
      })

      const reset = resetAssistantMessage(original)

      expect(reset.blocks).toEqual([])
      expect(reset.status).toBe('pending')
    })

    it('preserves other message fields', () => {
      const original = makeMessage({
        id: 'msg-xyz',
        role: 'assistant',
        topicId: 'topic-abc',
        assistantId: 'asst-def',
        blocks: ['block-1'],
        status: 'error',
        createdAt: '2024-01-01T00:00:00.000Z'
      })

      const reset = resetAssistantMessage(original)

      expect(reset.id).toBe('msg-xyz')
      expect(reset.topicId).toBe('topic-abc')
      expect(reset.assistantId).toBe('asst-def')
      expect(reset.createdAt).toBe('2024-01-01T00:00:00.000Z')
    })

    it('sets updatedAt to a new timestamp', () => {
      const original = makeMessage({ role: 'assistant', blocks: [], status: 'success' })

      const reset = resetAssistantMessage(original)

      expect(reset.updatedAt).toBeDefined()
      expect(typeof reset.updatedAt).toBe('string')
    })
  })

  describe('filterContextMessages', () => {
    const messages: Message[] = [
      makeMessage({ id: 'msg-1' }),
      makeMessage({ id: 'msg-2' }),
      makeMessage({ id: 'msg-3' }),
      makeMessage({ id: 'msg-4' }),
      makeMessage({ id: 'msg-5' })
    ]

    it('returns all messages when contextCount is CONTEXT_COUNT_UNLIMITED', () => {
      const result = filterContextMessages(messages, CONTEXT_COUNT_UNLIMITED)

      expect(result).toHaveLength(5)
      expect(result.map((m) => m.id)).toEqual(['msg-1', 'msg-2', 'msg-3', 'msg-4', 'msg-5'])
    })

    it('returns last N messages when contextCount is positive', () => {
      const result = filterContextMessages(messages, 3)

      expect(result).toHaveLength(3)
      expect(result.map((m) => m.id)).toEqual(['msg-3', 'msg-4', 'msg-5'])
    })

    it('returns empty array when contextCount is 0', () => {
      const result = filterContextMessages(messages, 0)

      expect(result).toHaveLength(0)
    })

    it('returns empty array when contextCount is negative (not unlimited)', () => {
      const result = filterContextMessages(messages, -2)

      expect(result).toHaveLength(0)
    })

    it('returns all messages when contextCount exceeds message count', () => {
      const result = filterContextMessages(messages, 100)

      expect(result).toHaveLength(5)
    })

    it('does not mutate the original array when returning unlimited', () => {
      const result = filterContextMessages(messages, CONTEXT_COUNT_UNLIMITED)

      expect(result).not.toBe(messages)
    })
  })

  describe('getContextCount', () => {
    it('returns current count equal to messages length', () => {
      const assistant = makeAssistant({ settings: { contextCount: 10, streamOutput: true } })
      const messages = [makeMessage(), makeMessage({ id: 'msg-2' }), makeMessage({ id: 'msg-3' })]

      const result = getContextCount(assistant, messages)

      expect(result.current).toBe(3)
    })

    it('returns max from assistant settings contextCount', () => {
      const assistant = makeAssistant({ settings: { contextCount: 8, streamOutput: true } })
      const messages = [makeMessage()]

      const result = getContextCount(assistant, messages)

      expect(result.max).toBe(8)
    })

    it('defaults max to 5 when contextCount is not set', () => {
      const assistant = makeAssistant({ settings: { streamOutput: true } })
      const messages = [makeMessage()]

      const result = getContextCount(assistant, messages)

      expect(result.max).toBe(5)
    })

    it('returns Infinity for max when contextCount is CONTEXT_COUNT_UNLIMITED', () => {
      const assistant = makeAssistant({
        settings: { contextCount: CONTEXT_COUNT_UNLIMITED, streamOutput: true }
      })
      const messages = [makeMessage()]

      const result = getContextCount(assistant, messages)

      expect(result.max).toBe(Infinity)
    })
  })

  describe('checkRateLimit', () => {
    it('returns not limited when provider has no rateLimit', () => {
      const provider = makeProvider({ rateLimit: undefined })

      const result = checkRateLimit(provider)

      expect(result.limited).toBe(false)
      expect(result.waitMs).toBe(0)
    })

    it('returns not limited when provider rateLimit is 0', () => {
      const provider = makeProvider({ rateLimit: 0 })

      const result = checkRateLimit(provider)

      expect(result.limited).toBe(false)
      expect(result.waitMs).toBe(0)
    })

    it('returns not limited when no message has been recorded yet', () => {
      const provider = makeProvider({ rateLimit: 5 })

      const result = checkRateLimit(provider)

      expect(result.limited).toBe(false)
      expect(result.waitMs).toBe(0)
    })

    it('returns limited with waitMs when within rate limit window', () => {
      const provider = makeProvider({ id: 'provider-rl', rateLimit: 60 })

      recordMessageTime(provider.id)
      const result = checkRateLimit(provider)

      expect(result.limited).toBe(true)
      expect(result.waitMs).toBeGreaterThan(0)
      expect(result.waitMs).toBeLessThanOrEqual(60000)
    })

    it('returns not limited after rate limit window has elapsed', () => {
      const provider = makeProvider({ id: 'provider-elapsed', rateLimit: 1 })

      // Manually set the last message time to 2 seconds ago
      recordMessageTime(provider.id)
      vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 2000)

      const result = checkRateLimit(provider)

      expect(result.limited).toBe(false)
      expect(result.waitMs).toBe(0)

      vi.restoreAllMocks()
    })

    it('calculates elapsed time correctly', () => {
      const provider = makeProvider({ id: 'provider-calc', rateLimit: 10 })

      const now = 1_000_000
      vi.spyOn(Date, 'now').mockReturnValueOnce(now) // recordMessageTime call
      recordMessageTime(provider.id)

      vi.spyOn(Date, 'now').mockReturnValue(now + 3000) // checkRateLimit call (3s elapsed, 10s limit)
      const result = checkRateLimit(provider)

      expect(result.limited).toBe(true)
      expect(result.waitMs).toBe(7000) // 10000 - 3000

      vi.restoreAllMocks()
    })
  })
})
