import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist and broadcastSync middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn
}))

vi.mock('../../../../src/renderer/src/stores/middleware/broadcastSync', () => ({
  broadcastSync: (fn: any, _name: string) => fn
}))

import { useAssistantStore } from '../../../../src/renderer/src/stores/useAssistantStore'
import type { Assistant, AssistantSettings, Topic } from '@shared/types'

// ── Factory Helpers ──

function makeAssistant(overrides: Partial<Assistant> = {}): Assistant {
  return {
    id: 'asst-1',
    name: 'Test Assistant',
    prompt: 'You are a helpful assistant.',
    model: null,
    defaultModel: null,
    settings: {},
    topics: [],
    type: 'chat',
    ...overrides
  }
}

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: 'topic-1',
    assistantId: 'asst-1',
    name: 'Test Topic',
    pinned: false,
    createdAt: new Date(1000).toISOString(),
    updatedAt: new Date(1000).toISOString(),
    ...overrides
  }
}

// ── Tests ──

describe('useAssistantStore', () => {
  beforeEach(() => {
    useAssistantStore.setState({
      defaultAssistant: makeAssistant({ id: 'default', type: 'default' }),
      assistants: [],
      tagsOrder: [],
      collapsedTags: {}
    })
  })

  // ── addAssistant ──

  describe('addAssistant', () => {
    it('should prepend assistant to the assistants array', () => {
      const a1 = makeAssistant({ id: 'a1' })
      const a2 = makeAssistant({ id: 'a2' })
      useAssistantStore.getState().addAssistant(a1)
      useAssistantStore.getState().addAssistant(a2)
      const { assistants } = useAssistantStore.getState()
      expect(assistants).toHaveLength(2)
      // a2 should be at index 0 because it was prepended last
      expect(assistants[0].id).toBe('a2')
      expect(assistants[1].id).toBe('a1')
    })

    it('should add a single assistant', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      expect(useAssistantStore.getState().assistants).toHaveLength(1)
      expect(useAssistantStore.getState().assistants[0].id).toBe('asst-1')
    })
  })

  // ── removeAssistant ──

  describe('removeAssistant', () => {
    it('should remove the correct assistant by id', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a1' }))
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a2' }))
      useAssistantStore.getState().removeAssistant('a1')
      const { assistants } = useAssistantStore.getState()
      expect(assistants).toHaveLength(1)
      expect(assistants[0].id).toBe('a2')
    })

    it('should do nothing for a non-existent id', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      useAssistantStore.getState().removeAssistant('nonexistent')
      expect(useAssistantStore.getState().assistants).toHaveLength(1)
    })
  })

  // ── updateAssistant ──

  describe('updateAssistant', () => {
    it('should merge partial updates into the assistant', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      useAssistantStore.getState().updateAssistant('asst-1', { name: 'Updated Name' })
      expect(useAssistantStore.getState().assistants[0].name).toBe('Updated Name')
    })

    it('should not affect other assistants', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a1', name: 'A1' }))
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a2', name: 'A2' }))
      useAssistantStore.getState().updateAssistant('a1', { name: 'Updated A1' })
      const a2 = useAssistantStore.getState().assistants.find((a) => a.id === 'a2')
      expect(a2?.name).toBe('A2')
    })
  })

  // ── updateAssistantSettings ──

  describe('updateAssistantSettings', () => {
    it('should merge settings into an assistant with existing settings', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ settings: { temperature: 0.5 } }))
      useAssistantStore.getState().updateAssistantSettings('asst-1', { maxTokens: 2048 })
      const { settings } = useAssistantStore.getState().assistants[0]
      expect(settings.temperature).toBe(0.5)
      expect(settings.maxTokens).toBe(2048)
    })

    it('should initialize settings if undefined and apply updates', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ settings: undefined as any }))
      useAssistantStore.getState().updateAssistantSettings('asst-1', { streamOutput: true })
      const { settings } = useAssistantStore.getState().assistants[0]
      expect(settings.streamOutput).toBe(true)
    })
  })

  // ── addTopic ──

  describe('addTopic', () => {
    it('should prepend a topic to the correct assistant', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      const t1 = makeTopic({ id: 't1' })
      const t2 = makeTopic({ id: 't2' })
      useAssistantStore.getState().addTopic('asst-1', t1)
      useAssistantStore.getState().addTopic('asst-1', t2)
      const { topics } = useAssistantStore.getState().assistants[0]
      expect(topics[0].id).toBe('t2')
      expect(topics[1].id).toBe('t1')
    })

    it('should deduplicate topics by id', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      const topic = makeTopic()
      useAssistantStore.getState().addTopic('asst-1', topic)
      useAssistantStore.getState().addTopic('asst-1', topic) // duplicate
      expect(useAssistantStore.getState().assistants[0].topics).toHaveLength(1)
    })

    it('should set createdAt and updatedAt timestamps on the topic', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      useAssistantStore.getState().addTopic('asst-1', makeTopic())
      const topic = useAssistantStore.getState().assistants[0].topics[0]
      expect(topic.createdAt).toBeDefined()
      expect(topic.updatedAt).toBeDefined()
    })
  })

  // ── removeTopic ──

  describe('removeTopic', () => {
    it('should remove the correct topic from the correct assistant', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      useAssistantStore.getState().addTopic('asst-1', makeTopic({ id: 't1' }))
      useAssistantStore.getState().addTopic('asst-1', makeTopic({ id: 't2' }))
      useAssistantStore.getState().removeTopic('asst-1', 't1')
      const { topics } = useAssistantStore.getState().assistants[0]
      expect(topics).toHaveLength(1)
      expect(topics[0].id).toBe('t2')
    })
  })

  // ── updateTopic ──

  describe('updateTopic', () => {
    it('should merge partial updates into a single topic', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      useAssistantStore.getState().addTopic('asst-1', makeTopic())
      useAssistantStore.getState().updateTopic('asst-1', { id: 'topic-1', name: 'Renamed Topic' })
      const topic = useAssistantStore.getState().assistants[0].topics[0]
      expect(topic.name).toBe('Renamed Topic')
      expect(topic.pinned).toBe(false) // other fields preserved
    })
  })

  // ── updateTopics ──

  describe('updateTopics', () => {
    it('should replace all topics for the assistant', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      useAssistantStore.getState().addTopic('asst-1', makeTopic({ id: 't1' }))
      const newTopics: Topic[] = [makeTopic({ id: 'nt1' }), makeTopic({ id: 'nt2' })]
      useAssistantStore.getState().updateTopics('asst-1', newTopics)
      const { topics } = useAssistantStore.getState().assistants[0]
      expect(topics).toHaveLength(2)
      expect(topics.map((t) => t.id)).toEqual(['nt1', 'nt2'])
    })
  })

  // ── removeAllTopics ──

  describe('removeAllTopics', () => {
    it('should clear all topics and reset to default', () => {
      useAssistantStore.getState().addAssistant(makeAssistant())
      useAssistantStore.getState().addTopic('asst-1', makeTopic({ id: 't1' }))
      useAssistantStore.getState().addTopic('asst-1', makeTopic({ id: 't2' }))
      useAssistantStore.getState().removeAllTopics('asst-1')
      const { topics } = useAssistantStore.getState().assistants[0]
      // Should be empty or reset to a default topic
      expect(topics.length).toBeLessThanOrEqual(1)
    })
  })

  // ── setDefaultAssistant ──

  describe('setDefaultAssistant', () => {
    it('should update the default assistant', () => {
      const newDefault = makeAssistant({ id: 'new-default', name: 'New Default' })
      useAssistantStore.getState().setDefaultAssistant(newDefault)
      expect(useAssistantStore.getState().defaultAssistant.id).toBe('new-default')
      expect(useAssistantStore.getState().defaultAssistant.name).toBe('New Default')
    })
  })

  // ── Selectors ──

  describe('getAssistant', () => {
    it('should return the assistant with the given id', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a1', name: 'Alpha' }))
      const result = useAssistantStore.getState().getAssistant('a1')
      expect(result).toBeDefined()
      expect(result?.name).toBe('Alpha')
    })

    it('should return undefined for a non-existent id', () => {
      const result = useAssistantStore.getState().getAssistant('missing')
      expect(result).toBeUndefined()
    })
  })

  describe('getAllTopics', () => {
    it('should return a flat array of all topics across all assistants', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a1' }))
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a2' }))
      useAssistantStore.getState().addTopic('a1', makeTopic({ id: 't1', assistantId: 'a1' }))
      useAssistantStore.getState().addTopic('a2', makeTopic({ id: 't2', assistantId: 'a2' }))
      const allTopics = useAssistantStore.getState().getAllTopics()
      expect(allTopics).toHaveLength(2)
      expect(allTopics.map((t) => t.id)).toContain('t1')
      expect(allTopics.map((t) => t.id)).toContain('t2')
    })

    it('should return an empty array when there are no assistants', () => {
      expect(useAssistantStore.getState().getAllTopics()).toEqual([])
    })
  })

  describe('getTopicsForAssistant', () => {
    it('should return only the topics belonging to the given assistant', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a1' }))
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a2' }))
      useAssistantStore.getState().addTopic('a1', makeTopic({ id: 't1', assistantId: 'a1' }))
      useAssistantStore.getState().addTopic('a2', makeTopic({ id: 't2', assistantId: 'a2' }))
      const topics = useAssistantStore.getState().getTopicsForAssistant('a1')
      expect(topics).toHaveLength(1)
      expect(topics[0].id).toBe('t1')
    })

    it('should return an empty array for an assistant with no topics', () => {
      useAssistantStore.getState().addAssistant(makeAssistant({ id: 'a1' }))
      expect(useAssistantStore.getState().getTopicsForAssistant('a1')).toEqual([])
    })
  })
})
