import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock zustand persist and broadcastSync middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn
}))

vi.mock('../../../../src/renderer/src/stores/middleware/broadcastSync', () => ({
  broadcastSync: (fn: any, _name: string) => fn
}))

import { useRuntimeStore } from '../../../../src/renderer/src/stores/useRuntimeStore'

// ── Tests ──

describe('useRuntimeStore', () => {
  beforeEach(() => {
    useRuntimeStore.setState({
      activeAssistantId: null,
      activeTopicId: null,
      generating: {},
      streamingMessageId: null,
      renamingTopics: new Set<string>()
    })
  })

  // ── setActiveAssistant ──

  describe('setActiveAssistant', () => {
    it('should set the active assistant id', () => {
      useRuntimeStore.getState().setActiveAssistant('asst-42')
      expect(useRuntimeStore.getState().activeAssistantId).toBe('asst-42')
    })

    it('should overwrite a previously set active assistant', () => {
      useRuntimeStore.getState().setActiveAssistant('asst-1')
      useRuntimeStore.getState().setActiveAssistant('asst-2')
      expect(useRuntimeStore.getState().activeAssistantId).toBe('asst-2')
    })
  })

  // ── setActiveTopic ──

  describe('setActiveTopic', () => {
    it('should set the active topic id', () => {
      useRuntimeStore.getState().setActiveTopic('topic-99')
      expect(useRuntimeStore.getState().activeTopicId).toBe('topic-99')
    })

    it('should overwrite a previously set active topic', () => {
      useRuntimeStore.getState().setActiveTopic('topic-1')
      useRuntimeStore.getState().setActiveTopic('topic-2')
      expect(useRuntimeStore.getState().activeTopicId).toBe('topic-2')
    })
  })

  // ── setGenerating ──

  describe('setGenerating', () => {
    it('should mark a topic as generating', () => {
      useRuntimeStore.getState().setGenerating('topic-1', true)
      expect(useRuntimeStore.getState().generating['topic-1']).toBe(true)
    })

    it('should clear the generating flag for a topic', () => {
      useRuntimeStore.getState().setGenerating('topic-1', true)
      useRuntimeStore.getState().setGenerating('topic-1', false)
      expect(useRuntimeStore.getState().generating['topic-1']).toBe(false)
    })

    it('should track multiple topics independently', () => {
      useRuntimeStore.getState().setGenerating('topic-1', true)
      useRuntimeStore.getState().setGenerating('topic-2', false)
      const { generating } = useRuntimeStore.getState()
      expect(generating['topic-1']).toBe(true)
      expect(generating['topic-2']).toBe(false)
    })
  })

  // ── setStreamingMessage ──

  describe('setStreamingMessage', () => {
    it('should set the streaming message id', () => {
      useRuntimeStore.getState().setStreamingMessage('msg-stream-1')
      expect(useRuntimeStore.getState().streamingMessageId).toBe('msg-stream-1')
    })

    it('should clear the streaming message id when set to null', () => {
      useRuntimeStore.getState().setStreamingMessage('msg-stream-1')
      useRuntimeStore.getState().setStreamingMessage(null)
      expect(useRuntimeStore.getState().streamingMessageId).toBeNull()
    })
  })

  // ── addRenamingTopic ──

  describe('addRenamingTopic', () => {
    it('should add a topic id to the renaming set', () => {
      useRuntimeStore.getState().addRenamingTopic('topic-1')
      expect(useRuntimeStore.getState().renamingTopics.has('topic-1')).toBe(true)
    })

    it('should support adding multiple topic ids', () => {
      useRuntimeStore.getState().addRenamingTopic('topic-1')
      useRuntimeStore.getState().addRenamingTopic('topic-2')
      const { renamingTopics } = useRuntimeStore.getState()
      expect(renamingTopics.has('topic-1')).toBe(true)
      expect(renamingTopics.has('topic-2')).toBe(true)
    })

    it('should be idempotent when adding the same topic id twice', () => {
      useRuntimeStore.getState().addRenamingTopic('topic-1')
      useRuntimeStore.getState().addRenamingTopic('topic-1')
      expect(useRuntimeStore.getState().renamingTopics.size).toBe(1)
    })
  })

  // ── removeRenamingTopic ──

  describe('removeRenamingTopic', () => {
    it('should remove a topic id from the renaming set', () => {
      useRuntimeStore.getState().addRenamingTopic('topic-1')
      useRuntimeStore.getState().removeRenamingTopic('topic-1')
      expect(useRuntimeStore.getState().renamingTopics.has('topic-1')).toBe(false)
    })

    it('should not affect other renaming topics when removing one', () => {
      useRuntimeStore.getState().addRenamingTopic('topic-1')
      useRuntimeStore.getState().addRenamingTopic('topic-2')
      useRuntimeStore.getState().removeRenamingTopic('topic-1')
      const { renamingTopics } = useRuntimeStore.getState()
      expect(renamingTopics.has('topic-1')).toBe(false)
      expect(renamingTopics.has('topic-2')).toBe(true)
    })

    it('should do nothing when removing a non-existent topic id', () => {
      useRuntimeStore.getState().addRenamingTopic('topic-1')
      useRuntimeStore.getState().removeRenamingTopic('nonexistent')
      expect(useRuntimeStore.getState().renamingTopics.size).toBe(1)
    })
  })

  // ── Combined state transitions ──

  describe('combined state transitions', () => {
    it('should handle a full chat session lifecycle', () => {
      // Start session
      useRuntimeStore.getState().setActiveAssistant('asst-1')
      useRuntimeStore.getState().setActiveTopic('topic-1')

      // Begin generating
      useRuntimeStore.getState().setGenerating('topic-1', true)
      useRuntimeStore.getState().setStreamingMessage('msg-42')

      let state = useRuntimeStore.getState()
      expect(state.activeAssistantId).toBe('asst-1')
      expect(state.activeTopicId).toBe('topic-1')
      expect(state.generating['topic-1']).toBe(true)
      expect(state.streamingMessageId).toBe('msg-42')

      // Complete generation
      useRuntimeStore.getState().setGenerating('topic-1', false)
      useRuntimeStore.getState().setStreamingMessage(null)

      state = useRuntimeStore.getState()
      expect(state.generating['topic-1']).toBe(false)
      expect(state.streamingMessageId).toBeNull()
    })

    it('should allow renaming a topic while another is generating', () => {
      useRuntimeStore.getState().setGenerating('topic-1', true)
      useRuntimeStore.getState().addRenamingTopic('topic-2')

      const state = useRuntimeStore.getState()
      expect(state.generating['topic-1']).toBe(true)
      expect(state.renamingTopics.has('topic-2')).toBe(true)
    })
  })
})
