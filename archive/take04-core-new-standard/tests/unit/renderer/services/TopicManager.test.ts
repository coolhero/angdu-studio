import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Middleware mocks ──

vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn
}))

vi.mock('../../../../src/renderer/src/stores/middleware/broadcastSync', () => ({
  broadcastSync: (fn: any, _name: string) => fn
}))

// ── uuid mock — deterministic IDs ──

const { mockUuid } = vi.hoisted(() => ({
  mockUuid: vi.fn(() => 'test-uuid-fixed')
}))

vi.mock('uuid', () => ({ v4: mockUuid }))

// ── Dexie db mock ──

const {
  mockMessagesToArray,
  mockMessagesDelete,
  mockBlocksDelete,
  mockTopicsDelete,
  mockTopicsPut
} = vi.hoisted(() => ({
  mockMessagesToArray: vi.fn().mockResolvedValue([]),
  mockMessagesDelete: vi.fn().mockResolvedValue(undefined),
  mockBlocksDelete: vi.fn().mockResolvedValue(undefined),
  mockTopicsDelete: vi.fn().mockResolvedValue(undefined),
  mockTopicsPut: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../../../src/renderer/src/lib/db', () => ({
  db: {
    topics: {
      put: mockTopicsPut,
      delete: mockTopicsDelete
    },
    messages: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: mockMessagesToArray,
          delete: mockMessagesDelete
        })
      })
    },
    message_blocks: {
      where: vi.fn().mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          delete: mockBlocksDelete
        })
      })
    }
  }
}))

// ── Import stores and service after mocks ──

import { useAssistantStore } from '../../../../src/renderer/src/stores/useAssistantStore'
import { useMessageStore } from '../../../../src/renderer/src/stores/useMessageStore'
import { createDefaultTopic, removeTopic, clearTopicMessages } from '../../../../src/renderer/src/services/TopicManager'
import type { Assistant, Topic, Message, MainTextBlock } from '@shared/types'

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
    content: 'Hello',
    status: 'success',
    createdAt: new Date(1000).toISOString(),
    ...overrides
  }
}

// ── Test suite ──

describe('TopicManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset stores
    useAssistantStore.setState({
      defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
      assistants: [],
      tagsOrder: [],
      collapsedTags: {}
    })

    useMessageStore.setState({
      messagesByTopic: {},
      entities: {},
      blockEntities: {},
      currentTopicId: null,
      loadingByTopic: {},
      displayCount: 20
    })
  })

  // ── createDefaultTopic ──

  describe('createDefaultTopic', () => {
    it('should return a topic with a uuid id', () => {
      mockUuid.mockReturnValueOnce('uuid-abc-123')

      const topic = createDefaultTopic('asst-42')

      expect(topic.id).toBe('uuid-abc-123')
      expect(mockUuid).toHaveBeenCalledOnce()
    })

    it('should set the correct assistantId', () => {
      const topic = createDefaultTopic('asst-xyz')

      expect(topic.assistantId).toBe('asst-xyz')
    })

    it('should set type to "chat"', () => {
      const topic = createDefaultTopic('asst-1')

      expect(topic.type).toBe('chat')
    })

    it('should set pinned to false', () => {
      const topic = createDefaultTopic('asst-1')

      expect(topic.pinned).toBe(false)
    })

    it('should set name to "New Topic"', () => {
      const topic = createDefaultTopic('asst-1')

      expect(topic.name).toBe('New Topic')
    })

    it('should set isNameManuallyEdited to false', () => {
      const topic = createDefaultTopic('asst-1')

      expect(topic.isNameManuallyEdited).toBe(false)
    })

    it('should set createdAt and updatedAt as valid ISO strings', () => {
      const before = new Date().toISOString()
      const topic = createDefaultTopic('asst-1')
      const after = new Date().toISOString()

      expect(topic.createdAt >= before).toBe(true)
      expect(topic.createdAt <= after).toBe(true)
      expect(topic.updatedAt >= before).toBe(true)
      expect(topic.updatedAt <= after).toBe(true)
    })

    it('should set createdAt and updatedAt to the same value', () => {
      const topic = createDefaultTopic('asst-1')

      expect(topic.createdAt).toBe(topic.updatedAt)
    })

    it('should not persist or add to the store', () => {
      createDefaultTopic('asst-1')

      expect(mockTopicsPut).not.toHaveBeenCalled()
      expect(useAssistantStore.getState().getAllTopics()).toHaveLength(0)
    })
  })

  // ── removeTopic ──

  describe('removeTopic', () => {
    it('should remove the topic from the assistant store', async () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      useAssistantStore.setState({
        defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
        assistants: [{ ...assistant, topics: [topic] }],
        tagsOrder: [],
        collapsedTags: {}
      })

      await removeTopic(assistant.id, topic.id)

      const remaining = useAssistantStore.getState().getTopicsForAssistant(assistant.id)
      expect(remaining).toHaveLength(0)
    })

    it('should clear topic messages from the message store', async () => {
      const assistant = makeAssistant()
      const topic = makeTopic()
      useAssistantStore.setState({
        defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
        assistants: [{ ...assistant, topics: [topic] }],
        tagsOrder: [],
        collapsedTags: {}
      })

      const msg = makeMessage({ id: 'msg-a', topicId: topic.id })
      useMessageStore.getState().addMessage(topic.id, msg)
      expect(useMessageStore.getState().messagesByTopic[topic.id]).toContain('msg-a')

      await removeTopic(assistant.id, topic.id)

      expect(useMessageStore.getState().messagesByTopic[topic.id]).toBeUndefined()
      expect(useMessageStore.getState().entities['msg-a']).toBeUndefined()
    })

    it('should call db.topics.delete with the correct topicId', async () => {
      const assistant = makeAssistant()
      const topic = makeTopic({ id: 'topic-del' })
      useAssistantStore.setState({
        defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
        assistants: [{ ...assistant, topics: [topic] }],
        tagsOrder: [],
        collapsedTags: {}
      })

      await removeTopic(assistant.id, 'topic-del')

      expect(mockTopicsDelete).toHaveBeenCalledWith('topic-del')
    })

    it('should cascade-delete message blocks and messages from Dexie when messages exist', async () => {
      const assistant = makeAssistant()
      const topic = makeTopic({ id: 'topic-cascade' })
      useAssistantStore.setState({
        defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
        assistants: [{ ...assistant, topics: [topic] }],
        tagsOrder: [],
        collapsedTags: {}
      })

      // Simulate Dexie returning messages for the topic
      const dbMessages = [
        makeMessage({ id: 'db-msg-1', topicId: 'topic-cascade' }),
        makeMessage({ id: 'db-msg-2', topicId: 'topic-cascade' })
      ]
      mockMessagesToArray.mockResolvedValueOnce(dbMessages)

      await removeTopic(assistant.id, 'topic-cascade')

      // Blocks deleted before messages
      expect(mockBlocksDelete).toHaveBeenCalledOnce()
      expect(mockMessagesDelete).toHaveBeenCalledOnce()
      expect(mockTopicsDelete).toHaveBeenCalledWith('topic-cascade')
    })

    it('should skip block and message deletes when there are no Dexie messages', async () => {
      const assistant = makeAssistant()
      const topic = makeTopic({ id: 'topic-empty' })
      useAssistantStore.setState({
        defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
        assistants: [{ ...assistant, topics: [topic] }],
        tagsOrder: [],
        collapsedTags: {}
      })

      mockMessagesToArray.mockResolvedValueOnce([])

      await removeTopic(assistant.id, 'topic-empty')

      expect(mockBlocksDelete).not.toHaveBeenCalled()
      expect(mockMessagesDelete).not.toHaveBeenCalled()
      // Topic itself must still be deleted
      expect(mockTopicsDelete).toHaveBeenCalledWith('topic-empty')
    })

    it('should not remove topics from other assistants', async () => {
      const a1 = makeAssistant({ id: 'a1' })
      const a2 = makeAssistant({ id: 'a2' })
      const t1 = makeTopic({ id: 't1', assistantId: 'a1' })
      const t2 = makeTopic({ id: 't2', assistantId: 'a2' })
      useAssistantStore.setState({
        defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
        assistants: [
          { ...a1, topics: [t1] },
          { ...a2, topics: [t2] }
        ],
        tagsOrder: [],
        collapsedTags: {}
      })

      await removeTopic('a1', 't1')

      const a2Topics = useAssistantStore.getState().getTopicsForAssistant('a2')
      expect(a2Topics).toHaveLength(1)
      expect(a2Topics[0].id).toBe('t2')
    })
  })

  // ── clearTopicMessages ──

  describe('clearTopicMessages', () => {
    it('should clear messages for the topic from the message store', async () => {
      const msg1 = makeMessage({ id: 'm1', topicId: 'topic-1' })
      const msg2 = makeMessage({ id: 'm2', topicId: 'topic-1' })
      useMessageStore.getState().addMessage('topic-1', msg1)
      useMessageStore.getState().addMessage('topic-1', msg2)

      await clearTopicMessages('topic-1')

      const state = useMessageStore.getState()
      expect(state.messagesByTopic['topic-1']).toBeUndefined()
      expect(state.entities['m1']).toBeUndefined()
      expect(state.entities['m2']).toBeUndefined()
    })

    it('should remove blocks associated with cleared messages from the store', async () => {
      const block = makeMainTextBlock({ id: 'b1', messageId: 'm1' })
      const msg = makeMessage({ id: 'm1', topicId: 'topic-1', blocks: ['b1'] })
      useMessageStore.getState().addMessage('topic-1', msg)
      useMessageStore.getState().upsertBlock(block)

      await clearTopicMessages('topic-1')

      expect(useMessageStore.getState().blockEntities['b1']).toBeUndefined()
    })

    it('should not affect messages belonging to other topics', async () => {
      const msg1 = makeMessage({ id: 'm1', topicId: 'topic-1' })
      const msg2 = makeMessage({ id: 'm2', topicId: 'topic-2' })
      useMessageStore.getState().addMessage('topic-1', msg1)
      useMessageStore.getState().addMessage('topic-2', msg2)

      await clearTopicMessages('topic-1')

      expect(useMessageStore.getState().entities['m2']).toBeDefined()
    })

    it('should cascade-delete message blocks then messages in Dexie', async () => {
      const dbMessages = [
        makeMessage({ id: 'db-m1', topicId: 'topic-1' }),
        makeMessage({ id: 'db-m2', topicId: 'topic-1' })
      ]
      mockMessagesToArray.mockResolvedValueOnce(dbMessages)

      await clearTopicMessages('topic-1')

      expect(mockBlocksDelete).toHaveBeenCalledOnce()
      expect(mockMessagesDelete).toHaveBeenCalledOnce()
    })

    it('should skip Dexie deletes when there are no messages in the db', async () => {
      mockMessagesToArray.mockResolvedValueOnce([])

      await clearTopicMessages('topic-1')

      expect(mockBlocksDelete).not.toHaveBeenCalled()
      expect(mockMessagesDelete).not.toHaveBeenCalled()
    })

    it('should not delete the topic itself from Dexie', async () => {
      mockMessagesToArray.mockResolvedValueOnce([])

      await clearTopicMessages('topic-1')

      expect(mockTopicsDelete).not.toHaveBeenCalled()
    })

    it('should handle clearTopicMessages on a topic with no in-store messages', async () => {
      // No messages added to store for this topic
      mockMessagesToArray.mockResolvedValueOnce([])

      await expect(clearTopicMessages('nonexistent-topic')).resolves.toBeUndefined()

      expect(mockBlocksDelete).not.toHaveBeenCalled()
      expect(mockMessagesDelete).not.toHaveBeenCalled()
    })
  })
})
