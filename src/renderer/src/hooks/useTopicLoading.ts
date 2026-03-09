import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'

export function useTopicLoading(topicId: string | null) {
  const generatingTopicIds = useRuntimeStore((s) => s.generatingTopicIds)

  const isGenerating = topicId ? generatingTopicIds.has(topicId) : false

  return {
    isLoading: isGenerating,
    isStreaming: isGenerating,
  }
}
