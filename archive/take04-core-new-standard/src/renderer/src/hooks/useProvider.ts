import { useMemo, useCallback } from 'react'
import { useLlmStore } from '../stores/useLlmStore'
import { CHERRYAI_PROVIDER, SYSTEM_PROVIDERS } from '../config/providers'
import { isSystemProvider } from '@shared/types'
import type { Provider, Model } from '@shared/types'

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function normalizeProvider(provider: Provider): Provider {
  return {
    ...provider,
    apiHost: normalizeUrl(provider.apiHost),
    ...(provider.anthropicApiHost ? { anthropicApiHost: normalizeUrl(provider.anthropicApiHost) } : {})
  }
}

// Returns enabled providers + CherryAI (always appended)
export function useProviders() {
  const providers = useLlmStore((s) => s.providers)
  const addProvider = useLlmStore((s) => s.addProvider)
  const removeProvider = useLlmStore((s) => s.removeProvider)
  const updateProvider = useLlmStore((s) => s.updateProvider)
  const updateAll = useLlmStore((s) => s.updateAll)

  const enabledProviders = useMemo(() => {
    const enabled = providers
      .filter((p) => p.enabled)
      .map(normalizeProvider)
    // Always append CherryAI if not already present
    if (!enabled.some((p) => p.id === CHERRYAI_PROVIDER.id)) {
      enabled.push(normalizeProvider(CHERRYAI_PROVIDER))
    }
    return enabled
  }, [providers])

  return {
    providers: enabledProviders,
    addProvider,
    removeProvider,
    updateProvider,
    updateAll
  }
}

// Returns a single provider by ID with fallback + model operations
export function useProvider(id: string) {
  const providers = useLlmStore((s) => s.providers)
  const addModel = useLlmStore((s) => s.addModel)
  const removeModel = useLlmStore((s) => s.removeModel)
  const updateModel = useLlmStore((s) => s.updateModel)

  const provider = useMemo(() => {
    const found = providers.find((p) => p.id === id)
    if (found) return normalizeProvider(found)
    // Check system providers
    const system = SYSTEM_PROVIDERS.find((p) => p.id === id)
    if (system) return normalizeProvider(system)
    // Fallback to CherryAI
    return normalizeProvider(CHERRYAI_PROVIDER)
  }, [providers, id])

  return {
    provider,
    models: provider.models,
    addModel: useCallback((model: Model) => addModel(id, model), [addModel, id]),
    removeModel: useCallback((modelId: string) => removeModel(id, modelId), [removeModel, id]),
    updateModel: useCallback((modelId: string, update: Partial<Model>) => updateModel(id, modelId, update), [updateModel, id])
  }
}

// Returns only system providers
export function useSystemProviders() {
  const providers = useLlmStore((s) => s.providers)
  return useMemo(() => providers.filter(isSystemProvider), [providers])
}

// Returns only user-created providers
export function useUserProviders() {
  const providers = useLlmStore((s) => s.providers)
  return useMemo(() => providers.filter((p) => !isSystemProvider(p)), [providers])
}

// Returns all providers regardless of enabled state
export function useAllProviders() {
  return useLlmStore((s) => s.providers)
}
