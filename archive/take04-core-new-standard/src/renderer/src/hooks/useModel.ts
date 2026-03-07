import { useMemo } from 'react'
import { useLlmStore } from '../stores/useLlmStore'
import type { Model } from '@shared/types'

export function useDefaultModel(): Model {
  return useLlmStore((s) => s.defaultModel)
}

export function useTopicNamingModel(): Model {
  return useLlmStore((s) => s.topicNamingModel)
}

export function useQuickModel(): Model {
  return useLlmStore((s) => s.quickModel)
}

export function useTranslateModel(): Model {
  return useLlmStore((s) => s.translateModel)
}

export function useModelsByProvider(providerId: string): Model[] {
  const providers = useLlmStore((s) => s.providers)
  return useMemo(() => {
    const provider = providers.find((p) => p.id === providerId)
    return provider?.models ?? []
  }, [providers, providerId])
}
