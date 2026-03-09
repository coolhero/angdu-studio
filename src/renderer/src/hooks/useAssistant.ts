import { useCallback, useMemo } from 'react'
import { useAssistantsStore } from '@renderer/stores/useAssistantsStore'
import type { AssistantSettings } from '@renderer/types/assistant'
import type { Model } from '@renderer/types/provider'
import type { Topic } from '@renderer/types/conversation'

export function useAssistant(assistantId: string | null) {
  const getAssistant = useAssistantsStore((s) => s.getAssistant)
  const updateAssistant = useAssistantsStore((s) => s.updateAssistant)
  const updateAssistantSettings = useAssistantsStore((s) => s.updateAssistantSettings)
  const addTopic = useAssistantsStore((s) => s.addTopic)

  const assistant = assistantId ? getAssistant(assistantId) : undefined

  const model = assistant?.model ?? assistant?.defaultModel ?? undefined

  const topics: Topic[] = useMemo(() => {
    return assistant?.topics ?? []
  }, [assistant?.topics])

  const handleAddTopic = useCallback(
    (partial?: Partial<Topic>) => {
      if (!assistantId) return undefined
      return addTopic(assistantId, partial)
    },
    [assistantId, addTopic]
  )

  const setModel = useCallback(
    (newModel: Model) => {
      if (!assistantId) return
      updateAssistant(assistantId, { model: newModel })
    },
    [assistantId, updateAssistant]
  )

  const updateSettings = useCallback(
    (settings: Partial<AssistantSettings>) => {
      if (!assistantId) return
      updateAssistantSettings(assistantId, settings)
    },
    [assistantId, updateAssistantSettings]
  )

  return { assistant, model, topics, addTopic: handleAddTopic, setModel, updateSettings }
}
