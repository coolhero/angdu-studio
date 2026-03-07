import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Middleware mocks ──

vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn
}))

vi.mock('../../../../src/renderer/src/stores/middleware/broadcastSync', () => ({
  broadcastSync: (fn: any, _name: string) => fn
}))

// ── Dexie db mock ──

const { mockTopicsPut } = vi.hoisted(() => ({
  mockTopicsPut: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../../../src/renderer/src/lib/db', () => ({
  db: {
    topics: {
      put: mockTopicsPut
    }
  }
}))

// ── Import stores and service after mocks are in place ──

import { useAssistantStore } from '../../../../src/renderer/src/stores/useAssistantStore'
import { useRuntimeStore } from '../../../../src/renderer/src/stores/useRuntimeStore'
import { autoRenameTopic } from '../../../../src/renderer/src/services/TopicNamingService'
import type { Assistant, Topic, Message, MessageBlock, MainTextBlock } from '@shared/types'

// ── Factory helpers ──

function makeAssistant(overrides: Partial<Assistant> = {}): Assistant {
  return {
    id: 'asst-1',
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
    assistantId: 'asst-1',
    name: 'New Topic',
    type: 'chat',
    pinned: false,
    isNameManuallyEdited: false,
    createdAt: new Date(1000).toISOString(),
    updatedAt: new Date(1000).toISOString(),
    ...overrides
  }
}

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
    content: 'Hello world',
    status: 'success',
    createdAt: new Date(1000).toISOString(),
    ...overrides
  }
}

// ── Test suite ──

describe('TopicNamingService — autoRenameTopic', () => {
  let assistant: Assistant
  let topic: Topic

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset both stores to a clean state
    useRuntimeStore.setState({
      activeAssistantId: null,
      activeTopicId: null,
      generating: {},
      streamingMessageId: null,
      renamingTopics: new Set()
    })

    assistant = makeAssistant()
    topic = makeTopic()

    // Pre-populate assistant store with one assistant and one topic
    useAssistantStore.setState({
      defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
      assistants: [{ ...assistant, topics: [topic] }],
      tagsOrder: [],
      collapsedTags: {}
    })
  })

  // ── 1. Happy path: renames topic from first user message ──

  it('should rename topic based on first user message content (first 50 chars)', async () => {
    const content = 'What is the capital of France?'
    const block = makeMainTextBlock({ id: 'b1', content })
    const message = makeMessage({ blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    await autoRenameTopic(topic.id, [message], assistant, blockEntities)

    // Verify the store was updated with the new name
    const updatedTopics = useAssistantStore.getState().getTopicsForAssistant(assistant.id)
    const updatedTopic = updatedTopics.find((t) => t.id === topic.id)
    expect(updatedTopic?.name).toBe(content)

    // Verify Dexie persistence
    expect(mockTopicsPut).toHaveBeenCalledOnce()
    const putArg = mockTopicsPut.mock.calls[0][0]
    expect(putArg.name).toBe(content)
    expect(putArg.id).toBe(topic.id)
  })

  // ── 2. Skip when isNameManuallyEdited is true ──

  it('should skip rename if topic.isNameManuallyEdited is true', async () => {
    const manualTopic = makeTopic({ isNameManuallyEdited: true })
    useAssistantStore.setState({
      defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
      assistants: [{ ...assistant, topics: [manualTopic] }],
      tagsOrder: [],
      collapsedTags: {}
    })

    const block = makeMainTextBlock({ id: 'b1', content: 'Should not rename' })
    const message = makeMessage({ blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    await autoRenameTopic(manualTopic.id, [message], assistant, blockEntities)

    expect(mockTopicsPut).not.toHaveBeenCalled()

    const topics = useAssistantStore.getState().getTopicsForAssistant(assistant.id)
    const t = topics.find((x) => x.id === manualTopic.id)
    expect(t?.name).toBe('New Topic') // unchanged
  })

  // ── 3. Concurrency lock: second call while first is in progress is skipped ──

  it('should not rename concurrently (naming lock prevents re-entrant calls)', async () => {
    // Simulate a long-running put to keep the lock held during the second call
    let resolvePut!: () => void
    mockTopicsPut.mockImplementationOnce(
      () => new Promise<void>((res) => { resolvePut = res })
    )

    const block = makeMainTextBlock({ id: 'b1', content: 'First rename attempt' })
    const message = makeMessage({ blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    // Start first rename (will block on db.topics.put)
    const first = autoRenameTopic(topic.id, [message], assistant, blockEntities)

    // Start second rename immediately — the lock should already be held
    const second = autoRenameTopic(topic.id, [message], assistant, blockEntities)

    // Unblock the first operation
    resolvePut()
    await Promise.all([first, second])

    // put should only have been called once (second call was skipped by the lock)
    expect(mockTopicsPut).toHaveBeenCalledOnce()
  })

  // ── 4. No-op when messages array is empty ──

  it('should handle empty messages gracefully without persisting', async () => {
    await autoRenameTopic(topic.id, [], assistant, {})

    expect(mockTopicsPut).not.toHaveBeenCalled()

    const topics = useAssistantStore.getState().getTopicsForAssistant(assistant.id)
    const t = topics.find((x) => x.id === topic.id)
    expect(t?.name).toBe('New Topic') // unchanged
  })

  // ── 5. No-op when there is no user message ──

  it('should handle messages with no user role gracefully', async () => {
    const block = makeMainTextBlock({ id: 'b1', content: 'Assistant reply' })
    const assistantMessage = makeMessage({ role: 'assistant', blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    await autoRenameTopic(topic.id, [assistantMessage], assistant, blockEntities)

    expect(mockTopicsPut).not.toHaveBeenCalled()
  })

  // ── 6. No-op when first user message has no main_text blocks ──

  it('should handle user message with no main_text blocks gracefully', async () => {
    const message = makeMessage({ blocks: [] })

    await autoRenameTopic(topic.id, [message], assistant, {})

    expect(mockTopicsPut).not.toHaveBeenCalled()
  })

  // ── 7. Truncate at word boundary for messages longer than 50 chars ──

  it('should truncate long messages at the last word boundary before 50 chars', async () => {
    // "The quick brown fox jumped" fits in 50 chars but the full string is >50
    // "The quick brown fox jumped over the lazy dog and" - 48 chars, last space at 43 ("...fox")
    const content = 'The quick brown fox jumped over the lazy dog and then ran away'
    // slice(0, 50) = "The quick brown fox jumped over the lazy dog and t"
    // lastIndexOf(' ') in that slice = 47 (before "t") — but let's verify:
    // Indices: "The quick brown fox jumped over the lazy dog and t"
    //           0         1         2         3         4
    //           0123456789012345678901234567890123456789012345678901
    // lastSpace = 47 (the space before "t"), which is > 20, so truncate to 47 chars
    const expected = 'The quick brown fox jumped over the lazy dog and'

    const block = makeMainTextBlock({ id: 'b1', content })
    const message = makeMessage({ blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    await autoRenameTopic(topic.id, [message], assistant, blockEntities)

    const topics = useAssistantStore.getState().getTopicsForAssistant(assistant.id)
    const updatedTopic = topics.find((t) => t.id === topic.id)
    expect(updatedTopic?.name).toBe(expected)
    expect(mockTopicsPut.mock.calls[0][0].name).toBe(expected)
  })

  // ── 8. Truncate to hard 50-char limit when no suitable word boundary exists ──

  it('should truncate to 50 chars without word boundary when last space is at or before position 20', async () => {
    // 21 non-space chars, then spaces far apart — lastSpace <= 20 means use raw slice
    const content = 'Superlongwordwithoutanyspaces at all and continuing on forever here'
    // slice(0, 50) = "Superlongwordwithoutanyspaces at all and continuin"
    // lastIndexOf(' ') = 29 ("...anyspaces ") — wait, let me re-check:
    // "Superlongwordwithoutanyspaces at all and continuin"
    //  012345678901234567890123456789012345678901234567890
    // Space at index 29 (after "anyspaces"), > 20, so it will word-wrap
    // Let's craft a string where the first space is at index 21+ but lastSpace <= 20:
    // e.g., "AAAAAAAAAAAAAAAAAAAA Blong..." where space is at 20
    // slice(0,50) = "AAAAAAAAAAAAAAAAAAAA Blongwordblongwordblongwordbl"
    // lastSpace = 20, which is NOT > 20 (20 > 20 is false), so uses raw truncated slice
    const twentyAs = 'A'.repeat(20)
    const longSuffix = 'Blongwordblongwordblongwordblongword'
    const rawContent = twentyAs + ' ' + longSuffix // space at index 20
    const expected = rawContent.slice(0, 50) // raw truncation, no word boundary

    const block = makeMainTextBlock({ id: 'b1', content: rawContent })
    const message = makeMessage({ blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    await autoRenameTopic(topic.id, [message], assistant, blockEntities)

    const topics = useAssistantStore.getState().getTopicsForAssistant(assistant.id)
    const updatedTopic = topics.find((t) => t.id === topic.id)
    expect(updatedTopic?.name).toBe(expected)
  })

  // ── 9. Uses only the first user message when multiple exist ──

  it('should derive the name from the first user message, ignoring subsequent ones', async () => {
    const block1 = makeMainTextBlock({ id: 'b1', content: 'First question' })
    const block2 = makeMainTextBlock({ id: 'b2', content: 'Second question', messageId: 'msg-2' })
    const msg1 = makeMessage({ id: 'msg-1', role: 'user', blocks: ['b1'] })
    const msg2 = makeMessage({ id: 'msg-2', role: 'user', blocks: ['b2'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block1, b2: block2 }

    await autoRenameTopic(topic.id, [msg1, msg2], assistant, blockEntities)

    const topics = useAssistantStore.getState().getTopicsForAssistant(assistant.id)
    const updatedTopic = topics.find((t) => t.id === topic.id)
    expect(updatedTopic?.name).toBe('First question')
  })

  // ── 10. renamingTopics set is cleaned up after completion ──

  it('should add topicId to renamingTopics during rename and remove it after', async () => {
    const block = makeMainTextBlock({ id: 'b1', content: 'Hello' })
    const message = makeMessage({ blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    // Capture runtime state mid-flight by intercepting the put call
    let renamingDuringPut = false
    mockTopicsPut.mockImplementationOnce(async () => {
      renamingDuringPut = useRuntimeStore.getState().renamingTopics.has(topic.id)
    })

    await autoRenameTopic(topic.id, [message], assistant, blockEntities)

    expect(renamingDuringPut).toBe(true)
    expect(useRuntimeStore.getState().renamingTopics.has(topic.id)).toBe(false)
  })

  // ── 11. No-op when the topic does not exist in the store ──

  it('should do nothing if topicId is not found in the assistant store', async () => {
    const block = makeMainTextBlock({ id: 'b1', content: 'Hello' })
    const message = makeMessage({ blocks: ['b1'] })
    const blockEntities: Record<string, MessageBlock> = { b1: block }

    await autoRenameTopic('nonexistent-topic', [message], assistant, blockEntities)

    expect(mockTopicsPut).not.toHaveBeenCalled()
  })
})
