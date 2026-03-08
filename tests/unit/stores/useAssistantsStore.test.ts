import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Dexie before importing the store
vi.mock('../../../src/renderer/src/databases/ChatDatabase', () => ({
  chatDb: {
    assistants: {
      toArray: vi.fn().mockResolvedValue([]),
      put: vi.fn().mockResolvedValue(undefined),
      bulkPut: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
  },
  createDexieStorageAdapter: () => ({
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  }),
}))

import { useAssistantsStore } from '../../../src/renderer/src/stores/useAssistantsStore'

describe('useAssistantsStore', () => {
  beforeEach(() => {
    useAssistantsStore.setState({
      assistants: [],
      tags: { order: [], collapsed: {} },
      presets: [],
      unifiedOrder: [],
    })
  })

  describe('Assistant CRUD', () => {
    it('adds an assistant at the beginning of the list', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'Test Assistant',
        prompt: 'You are helpful.',
        type: 'default',
      })

      expect(assistant.id).toBeDefined()
      expect(assistant.name).toBe('Test Assistant')
      expect(assistant.topics).toHaveLength(1)

      const state = useAssistantsStore.getState()
      expect(state.assistants).toHaveLength(1)
      expect(state.assistants[0].id).toBe(assistant.id)
    })

    it('inserts an assistant at a specific index', () => {
      useAssistantsStore.getState().addAssistant({
        name: 'First',
        prompt: '',
        type: 'default',
      })
      useAssistantsStore.getState().addAssistant({
        name: 'Second',
        prompt: '',
        type: 'default',
      })

      const inserted = useAssistantsStore.getState().insertAssistant(1, {
        name: 'Middle',
        prompt: '',
        type: 'default',
      })

      const names = useAssistantsStore.getState().assistants.map((a) => a.name)
      expect(names).toEqual(['Second', 'Middle', 'First'])
      expect(inserted.name).toBe('Middle')
    })

    it('updates an assistant', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'Original',
        prompt: 'Old prompt',
        type: 'default',
      })

      useAssistantsStore.getState().updateAssistant(assistant.id, {
        name: 'Updated',
        prompt: 'New prompt',
      })

      const updated = useAssistantsStore.getState().getAssistant(assistant.id)
      expect(updated?.name).toBe('Updated')
      expect(updated?.prompt).toBe('New prompt')
    })

    it('updates assistant settings', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'Test',
        prompt: '',
        type: 'default',
      })

      useAssistantsStore.getState().updateAssistantSettings(assistant.id, {
        temperature: { value: 0.5, enabled: true },
        contextCount: 10,
      })

      const updated = useAssistantsStore.getState().getAssistant(assistant.id)
      expect(updated?.settings?.temperature).toEqual({ value: 0.5, enabled: true })
      expect(updated?.settings?.contextCount).toBe(10)
    })

    it('removes an assistant', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'To Delete',
        prompt: '',
        type: 'default',
      })

      useAssistantsStore.getState().removeAssistant(assistant.id)
      expect(useAssistantsStore.getState().assistants).toHaveLength(0)
    })

    it('reorders assistants', () => {
      const a1 = useAssistantsStore.getState().addAssistant({ name: 'A', prompt: '', type: 'default' })
      const a2 = useAssistantsStore.getState().addAssistant({ name: 'B', prompt: '', type: 'default' })
      const a3 = useAssistantsStore.getState().addAssistant({ name: 'C', prompt: '', type: 'default' })

      useAssistantsStore.getState().reorderAssistants([a1.id, a3.id, a2.id])

      const names = useAssistantsStore.getState().assistants.map((a) => a.name)
      expect(names).toEqual(['A', 'C', 'B'])
    })

    it('getAssistant returns undefined for non-existent id', () => {
      expect(useAssistantsStore.getState().getAssistant('non-existent')).toBeUndefined()
    })
  })

  describe('Topic Management', () => {
    it('adds a topic to an assistant', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'Test',
        prompt: '',
        type: 'default',
      })

      const topic = useAssistantsStore.getState().addTopic(assistant.id, { name: 'My Topic' })

      expect(topic.name).toBe('My Topic')
      expect(topic.assistantId).toBe(assistant.id)

      const updated = useAssistantsStore.getState().getAssistant(assistant.id)
      expect(updated?.topics).toHaveLength(2) // default topic + new one
    })

    it('removes a topic', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'Test',
        prompt: '',
        type: 'default',
      })
      const defaultTopicId = assistant.topics[0].id

      useAssistantsStore.getState().removeTopic(assistant.id, defaultTopicId)

      const updated = useAssistantsStore.getState().getAssistant(assistant.id)
      expect(updated?.topics).toHaveLength(0)
    })

    it('pins a topic', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'Test',
        prompt: '',
        type: 'default',
      })
      const topicId = assistant.topics[0].id

      useAssistantsStore.getState().pinTopic(assistant.id, topicId, true)

      const updated = useAssistantsStore.getState().getAssistant(assistant.id)
      expect(updated?.topics[0].pinned).toBe(true)
    })
  })

  describe('Tags', () => {
    it('sets tag order', () => {
      useAssistantsStore.getState().setTagOrder(['coding', 'writing', 'research'])
      expect(useAssistantsStore.getState().tags.order).toEqual(['coding', 'writing', 'research'])
    })

    it('sets tag collapsed state', () => {
      useAssistantsStore.getState().setTagCollapsed('coding', true)
      expect(useAssistantsStore.getState().tags.collapsed.coding).toBe(true)
    })
  })

  describe('Presets', () => {
    it('adds a preset', () => {
      const preset = useAssistantsStore.getState().addPreset({
        name: 'Code Expert',
        prompt: 'You are a coding expert.',
        settings: { contextCount: 10 },
      })

      expect(preset.id).toBeDefined()
      expect(useAssistantsStore.getState().presets).toHaveLength(1)
    })

    it('applies a preset to an assistant', () => {
      const assistant = useAssistantsStore.getState().addAssistant({
        name: 'Test',
        prompt: 'Old prompt',
        type: 'default',
      })
      const preset = useAssistantsStore.getState().addPreset({
        name: 'Expert',
        prompt: 'Expert prompt',
        settings: { contextCount: 20 },
      })

      useAssistantsStore.getState().applyPreset(preset.id, assistant.id)

      const updated = useAssistantsStore.getState().getAssistant(assistant.id)
      expect(updated?.prompt).toBe('Expert prompt')
      expect(updated?.settings?.contextCount).toBe(20)
    })

    it('removes a preset', () => {
      const preset = useAssistantsStore.getState().addPreset({
        name: 'To Delete',
        prompt: '',
        settings: {},
      })

      useAssistantsStore.getState().removePreset(preset.id)
      expect(useAssistantsStore.getState().presets).toHaveLength(0)
    })
  })

  describe('Unified Order', () => {
    it('sets unified order', () => {
      useAssistantsStore.getState().setUnifiedOrder(['id1', 'id2', 'id3'])
      expect(useAssistantsStore.getState().unifiedOrder).toEqual(['id1', 'id2', 'id3'])
    })
  })
})
