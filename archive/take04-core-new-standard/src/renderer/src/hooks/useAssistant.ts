// useAssistant — assistant management hook with Dexie persistence (F005)

import { useCallback } from 'react'
import { useAssistantStore } from '../stores/useAssistantStore'
import { useRuntimeStore } from '../stores/useRuntimeStore'
import { db } from '../lib/db'
import type { Assistant, AssistantSettings, Model } from '@shared/types'

// ── Default assistant shape for first-launch initialization ──

const DEFAULT_ASSISTANT: Assistant = {
  id: 'default',
  name: 'Default Assistant',
  type: 'default',
  prompt: '',
  model: null,
  defaultModel: null,
  settings: { contextCount: 5, streamOutput: true },
  topics: [],
  emoji: '🤖'
}

// ── Hook ──

export function useAssistant() {
  // ── Store selectors ──

  const assistants = useAssistantStore((s) => s.assistants)
  const defaultAssistant = useAssistantStore((s) => s.defaultAssistant)
  const storeGetAssistant = useAssistantStore((s) => s.getAssistant)

  const storeAddAssistant = useAssistantStore((s) => s.addAssistant)
  const storeRemoveAssistant = useAssistantStore((s) => s.removeAssistant)
  const storeUpdateAssistant = useAssistantStore((s) => s.updateAssistant)
  const storeUpdateAssistantSettings = useAssistantStore((s) => s.updateAssistantSettings)
  const storeRemoveAllTopics = useAssistantStore((s) => s.removeAllTopics)

  const activeAssistantId = useRuntimeStore((s) => s.activeAssistantId)
  const runtimeSetActiveAssistant = useRuntimeStore((s) => s.setActiveAssistant)

  // ── Derived: active assistant object ──

  const activeAssistant =
    assistants.find((a) => a.id === activeAssistantId) ?? defaultAssistant

  // ── addAssistant ──
  // Adds to store and persists to Dexie. Initializes default assistant on first launch.

  const addAssistant = useCallback(
    async (assistant: Assistant): Promise<void> => {
      storeAddAssistant(assistant)
      await db.assistants.put(assistant)
    },
    [storeAddAssistant]
  )

  // ── removeAssistant ──
  // Removes from store, deletes associated topics and messages from Dexie, then removes from Dexie.

  const removeAssistant = useCallback(
    async (assistantId: string): Promise<void> => {
      // 1. Collect topic IDs for this assistant so we can cascade-delete messages
      const assistant = storeGetAssistant(assistantId)
      const topicIds = assistant ? assistant.topics.map((t) => t.id) : []

      // 2. Delete messages and message_blocks for each topic
      for (const topicId of topicIds) {
        const messages = await db.messages.where('topicId').equals(topicId).toArray()
        const messageIds = messages.map((m) => m.id)

        if (messageIds.length > 0) {
          await db.message_blocks.where('messageId').anyOf(messageIds).delete()
          await db.messages.where('topicId').equals(topicId).delete()
        }
      }

      // 3. Delete topics from Dexie
      if (topicIds.length > 0) {
        await db.topics.where('assistantId').equals(assistantId).delete()
      }

      // 4. Remove from store (clears topics array too)
      storeRemoveAllTopics(assistantId)
      storeRemoveAssistant(assistantId)

      // 5. Delete assistant record from Dexie
      await db.assistants.delete(assistantId)
    },
    [storeGetAssistant, storeRemoveAllTopics, storeRemoveAssistant]
  )

  // ── updateAssistant ──
  // Applies partial updates to store and persists full merged record to Dexie.

  const updateAssistant = useCallback(
    async (assistant: Assistant): Promise<void> => {
      storeUpdateAssistant(assistant.id, assistant)
      await db.assistants.put(assistant)
    },
    [storeUpdateAssistant]
  )

  // ── updateAssistantSettings ──
  // Nested-merges settings into store and persists merged assistant to Dexie.

  const updateAssistantSettings = useCallback(
    async (assistantId: string, settings: Partial<AssistantSettings>): Promise<void> => {
      storeUpdateAssistantSettings(assistantId, settings)

      // Read merged state from store after update to persist the full record
      const updated = useAssistantStore.getState().getAssistant(assistantId)
      if (updated) {
        await db.assistants.put(updated)
      }
    },
    [storeUpdateAssistantSettings]
  )

  // ── setActiveAssistant ──
  // Updates runtime state only — no persistence needed (runtime is ephemeral).

  const setActiveAssistant = useCallback(
    (assistantId: string): void => {
      runtimeSetActiveAssistant(assistantId)
    },
    [runtimeSetActiveAssistant]
  )

  // ── setModel ──
  // Sets the model on the assistant. Handles reasoning_effort cache:
  // - Before switching away from a model: cache the current reasoning_effort in reasoning_effort_cache.
  // - After switching back to a model: restore reasoning_effort from reasoning_effort_cache if present.

  const setModel = useCallback(
    async (assistantId: string, model: Model | null): Promise<void> => {
      const assistant = storeGetAssistant(assistantId)
      if (!assistant) return

      const currentModel = assistant.model
      const currentSettings = assistant.settings ?? {}

      let updatedSettings: AssistantSettings = { ...currentSettings }

      if (model !== null) {
        const switchingToSameModel = currentModel?.id === model.id

        if (!switchingToSameModel) {
          // Cache the current reasoning_effort before switching away
          if (currentSettings.reasoning_effort !== undefined) {
            updatedSettings = {
              ...updatedSettings,
              reasoning_effort_cache: currentSettings.reasoning_effort
            }
          }

          // When switching back to a model that had a cached effort, restore it
          // The cache is keyed implicitly by restoring whenever we switch and a cache exists.
          // If the incoming model is different from current, we apply the cache if it was
          // previously stored by the user toggling back and forth.
          // Restore only when the new model matches a previously seen context.
          // Per spec: restore from cache when switching back — we restore unconditionally
          // from cache when switching to any model (cache represents the last-set effort).
          if (currentSettings.reasoning_effort_cache !== undefined) {
            updatedSettings = {
              ...updatedSettings,
              reasoning_effort: currentSettings.reasoning_effort_cache,
              reasoning_effort_cache: undefined
            }
          } else {
            // No cache: clear reasoning_effort for fresh model (let the model use its default)
            updatedSettings = {
              ...updatedSettings,
              reasoning_effort: undefined
            }
          }
        }
      }

      // Apply settings and model update to store
      storeUpdateAssistant(assistantId, { model, settings: updatedSettings })

      // Persist
      const updated = useAssistantStore.getState().getAssistant(assistantId)
      if (updated) {
        await db.assistants.put(updated)
      }
    },
    [storeGetAssistant, storeUpdateAssistant]
  )

  // ── getAssistant ──
  // Reads from store (synchronous).

  const getAssistant = useCallback(
    (id: string): Assistant | undefined => {
      return storeGetAssistant(id)
    },
    [storeGetAssistant]
  )

  // ── initDefaultAssistant ──
  // Called on first launch when no assistants exist. Creates the default assistant.

  const initDefaultAssistant = useCallback(async (): Promise<void> => {
    if (assistants.length === 0) {
      storeAddAssistant(DEFAULT_ASSISTANT)
      await db.assistants.put(DEFAULT_ASSISTANT)
      runtimeSetActiveAssistant(DEFAULT_ASSISTANT.id)
    }
  }, [assistants.length, storeAddAssistant, runtimeSetActiveAssistant])

  return {
    assistants,
    activeAssistant,
    defaultAssistant,
    addAssistant,
    removeAssistant,
    updateAssistant,
    updateAssistantSettings,
    setActiveAssistant,
    setModel,
    getAssistant,
    initDefaultAssistant
  }
}
