import { describe, it, expect, beforeEach } from 'vitest'
import { useRuntimeStore } from '../../../src/renderer/src/stores/useRuntimeStore'

describe('useRuntimeStore', () => {
  beforeEach(() => {
    useRuntimeStore.setState({
      activeAssistantId: null,
      activeTopicId: null,
      activeSessionId: null,
      activeAgentId: null,
      isMultiSelectMode: false,
      selectedMessageIds: new Set<string>(),
      generatingTopicIds: new Set<string>(),
    })
  })

  describe('setActiveAssistant', () => {
    it('sets the active assistant id', () => {
      useRuntimeStore.getState().setActiveAssistant('assistant-1')
      expect(useRuntimeStore.getState().activeAssistantId).toBe('assistant-1')
    })

    it('clears the active assistant when set to null', () => {
      useRuntimeStore.getState().setActiveAssistant('assistant-1')
      useRuntimeStore.getState().setActiveAssistant(null)
      expect(useRuntimeStore.getState().activeAssistantId).toBeNull()
    })
  })

  describe('setActiveTopic', () => {
    it('sets the active topic id', () => {
      useRuntimeStore.getState().setActiveTopic('topic-1')
      expect(useRuntimeStore.getState().activeTopicId).toBe('topic-1')
    })

    it('clears the active topic when set to null', () => {
      useRuntimeStore.getState().setActiveTopic('topic-1')
      useRuntimeStore.getState().setActiveTopic(null)
      expect(useRuntimeStore.getState().activeTopicId).toBeNull()
    })
  })

  describe('toggleMultiSelect', () => {
    it('enables multi-select mode', () => {
      useRuntimeStore.getState().toggleMultiSelect()
      expect(useRuntimeStore.getState().isMultiSelectMode).toBe(true)
    })

    it('disables multi-select mode and clears selection', () => {
      useRuntimeStore.getState().toggleMultiSelect() // enable
      useRuntimeStore.getState().selectMessage('msg-1')
      useRuntimeStore.getState().toggleMultiSelect() // disable

      expect(useRuntimeStore.getState().isMultiSelectMode).toBe(false)
      expect(useRuntimeStore.getState().selectedMessageIds.size).toBe(0)
    })
  })

  describe('selectMessage / deselectMessage', () => {
    it('adds a message id to the selection', () => {
      useRuntimeStore.getState().selectMessage('msg-1')
      expect(useRuntimeStore.getState().selectedMessageIds.has('msg-1')).toBe(true)
    })

    it('selects multiple messages', () => {
      useRuntimeStore.getState().selectMessage('msg-1')
      useRuntimeStore.getState().selectMessage('msg-2')
      expect(useRuntimeStore.getState().selectedMessageIds.size).toBe(2)
    })

    it('removes a message id from the selection', () => {
      useRuntimeStore.getState().selectMessage('msg-1')
      useRuntimeStore.getState().selectMessage('msg-2')
      useRuntimeStore.getState().deselectMessage('msg-1')

      expect(useRuntimeStore.getState().selectedMessageIds.has('msg-1')).toBe(false)
      expect(useRuntimeStore.getState().selectedMessageIds.has('msg-2')).toBe(true)
    })
  })

  describe('clearSelection', () => {
    it('clears all selected messages and disables multi-select', () => {
      useRuntimeStore.getState().toggleMultiSelect()
      useRuntimeStore.getState().selectMessage('msg-1')
      useRuntimeStore.getState().selectMessage('msg-2')

      useRuntimeStore.getState().clearSelection()

      expect(useRuntimeStore.getState().selectedMessageIds.size).toBe(0)
      expect(useRuntimeStore.getState().isMultiSelectMode).toBe(false)
    })
  })

  describe('setGenerating / isGenerating', () => {
    it('marks a topic as generating', () => {
      useRuntimeStore.getState().setGenerating('topic-1', true)
      expect(useRuntimeStore.getState().isGenerating('topic-1')).toBe(true)
    })

    it('clears generating state for a topic', () => {
      useRuntimeStore.getState().setGenerating('topic-1', true)
      useRuntimeStore.getState().setGenerating('topic-1', false)
      expect(useRuntimeStore.getState().isGenerating('topic-1')).toBe(false)
    })

    it('tracks multiple generating topics independently', () => {
      useRuntimeStore.getState().setGenerating('topic-1', true)
      useRuntimeStore.getState().setGenerating('topic-2', true)
      useRuntimeStore.getState().setGenerating('topic-1', false)

      expect(useRuntimeStore.getState().isGenerating('topic-1')).toBe(false)
      expect(useRuntimeStore.getState().isGenerating('topic-2')).toBe(true)
    })

    it('returns false for a topic that was never set', () => {
      expect(useRuntimeStore.getState().isGenerating('unknown')).toBe(false)
    })
  })
})
