// useTopic — topic management hook for a specific assistant (F005)

import { useCallback, useMemo } from 'react'
import { useAssistantStore } from '../stores/useAssistantStore'
import { useRuntimeStore } from '../stores/useRuntimeStore'
import { useMessageStore } from '../stores/useMessageStore'
import { db } from '../lib/db'
import { createDefaultTopic, removeTopic as removeTopicManager } from '../services/TopicManager'
import type { Topic } from '@shared/types'

// ── Hook ──

export function useTopic(assistantId: string) {
  // ── Derived state ──

  const rawTopics = useAssistantStore((state) => {
    const assistant = state.assistants.find((a) => a.id === assistantId)
    return assistant?.topics ?? []
  })

  const activeTopicId = useRuntimeStore((state) => state.activeTopicId)

  // Sort: pinned first, then by updatedAt descending
  const topics = useMemo<Topic[]>(() => {
    return [...rawTopics].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [rawTopics])

  const activeTopic = useMemo<Topic | undefined>(() => {
    if (!activeTopicId) return undefined
    return rawTopics.find((t) => t.id === activeTopicId)
  }, [rawTopics, activeTopicId])

  // ── setActiveTopic ──

  const setActiveTopic = useCallback(
    async (topicId: string): Promise<void> => {
      useRuntimeStore.getState().setActiveTopic(topicId)
      await useMessageStore.getState().loadTopicMessages(topicId)
    },
    []
  )

  // ── addTopic ──

  const addTopic = useCallback(
    async (name?: string): Promise<Topic> => {
      const topic = createDefaultTopic(assistantId)
      if (name) {
        topic.name = name
        topic.isNameManuallyEdited = true
      }

      // Add to store
      useAssistantStore.getState().addTopic(assistantId, topic)

      // Persist to Dexie
      await db.topics.put(topic)

      // Set as active and load messages (empty)
      await setActiveTopic(topic.id)

      return topic
    },
    [assistantId, setActiveTopic]
  )

  // ── removeTopic ──

  const removeTopic = useCallback(
    async (topicId: string): Promise<void> => {
      await removeTopicManager(assistantId, topicId)

      // If the removed topic was active, clear the active topic
      if (useRuntimeStore.getState().activeTopicId === topicId) {
        const remainingTopics = useAssistantStore.getState().getTopicsForAssistant(assistantId)
        const nextTopic = remainingTopics[0]
        if (nextTopic) {
          await setActiveTopic(nextTopic.id)
        } else {
          useRuntimeStore.getState().setActiveTopic('')
        }
      }
    },
    [assistantId, setActiveTopic]
  )

  // ── updateTopic ──

  const updateTopic = useCallback(
    async (topicId: string, updates: Partial<Omit<Topic, 'id' | 'assistantId'>>): Promise<void> => {
      const now = new Date().toISOString()
      const patch = { ...updates, updatedAt: now }

      useAssistantStore.getState().updateTopic(assistantId, { id: topicId, ...patch })

      const existing = await db.topics.get(topicId)
      if (existing) {
        await db.topics.put({ ...existing, ...patch })
      }
    },
    [assistantId]
  )

  // ── pinTopic ──

  const pinTopic = useCallback(
    async (topicId: string): Promise<void> => {
      await updateTopic(topicId, { pinned: true })
    },
    [updateTopic]
  )

  // ── unpinTopic ──

  const unpinTopic = useCallback(
    async (topicId: string): Promise<void> => {
      await updateTopic(topicId, { pinned: false })
    },
    [updateTopic]
  )

  // ── renameTopic ──

  const renameTopic = useCallback(
    async (topicId: string, name: string): Promise<void> => {
      await updateTopic(topicId, { name, isNameManuallyEdited: true })
    },
    [updateTopic]
  )

  return {
    topics,
    activeTopic,
    setActiveTopic,
    addTopic,
    removeTopic,
    updateTopic,
    pinTopic,
    unpinTopic,
    renameTopic
  }
}
