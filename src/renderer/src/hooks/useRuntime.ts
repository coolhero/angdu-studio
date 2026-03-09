import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'

export function useRuntime() {
  const activeAssistantId = useRuntimeStore((s) => s.activeAssistantId)
  const activeTopicId = useRuntimeStore((s) => s.activeTopicId)
  const generatingTopicIds = useRuntimeStore((s) => s.generatingTopicIds)
  const setActiveAssistant = useRuntimeStore((s) => s.setActiveAssistant)
  const setActiveTopic = useRuntimeStore((s) => s.setActiveTopic)

  const isGenerating = activeTopicId ? generatingTopicIds.has(activeTopicId) : false

  return { activeAssistantId, activeTopicId, isGenerating, setActiveAssistant, setActiveTopic }
}
