// ModelResolver — model resolution (traditional + namespaced) (F003)

import type { LanguageModelV1 as LanguageModel, EmbeddingModelV1 as EmbeddingModel } from 'ai'
import type { ProviderId, BaseProviderSettings } from '../../types'
import { getProviderFactory } from '../providers/registry'
import { ModelResolutionError } from '../errors'

const NAMESPACED_SEPARATOR = ':'

// Provider instances with languageModel/textEmbeddingModel methods
interface ProviderInstance {
  languageModel?: (modelId: string) => LanguageModel
  textEmbeddingModel?: (modelId: string) => EmbeddingModel<string>
  image?: (modelId: string) => unknown
  (modelId: string): LanguageModel
}

export class ModelResolver {
  private providerCache = new Map<string, ProviderInstance>()

  // ── Parse namespaced model ID ──

  private parseModelId(modelId: string): { providerId: ProviderId | null; bareModelId: string } {
    const sepIndex = modelId.indexOf(NAMESPACED_SEPARATOR)
    if (sepIndex === -1) {
      return { providerId: null, bareModelId: modelId }
    }
    const providerId = modelId.slice(0, sepIndex) as ProviderId
    const bareModelId = modelId.slice(sepIndex + 1)
    return { providerId, bareModelId }
  }

  // ── Get or create provider instance ──

  private getProvider(providerId: ProviderId, settings: BaseProviderSettings): ProviderInstance {
    const cacheKey = `${providerId}:${settings.apiKey ?? ''}:${settings.baseURL ?? ''}`
    let provider = this.providerCache.get(cacheKey)
    if (!provider) {
      try {
        provider = getProviderFactory(providerId)(settings) as ProviderInstance
        this.providerCache.set(cacheKey, provider)
      } catch (error) {
        throw new ModelResolutionError(`Failed to create provider "${providerId}"`, { providerId }, error as Error)
      }
    }
    return provider
  }

  // ── Resolve language model ──

  resolveLanguageModel(modelId: string, fallbackProviderId: string, settings: BaseProviderSettings): LanguageModel {
    const { providerId: namespacedProvider, bareModelId } = this.parseModelId(modelId)
    const effectiveProviderId = (namespacedProvider ?? fallbackProviderId) as ProviderId
    const effectiveModelId = namespacedProvider ? bareModelId : modelId

    const provider = this.getProvider(effectiveProviderId, settings)

    if (provider.languageModel) {
      return provider.languageModel(effectiveModelId)
    }
    // Fallback: call provider directly as a function
    return provider(effectiveModelId)
  }

  // ── Resolve embedding model ──

  resolveTextEmbeddingModel(modelId: string, fallbackProviderId: string, settings: BaseProviderSettings): EmbeddingModel<string> {
    const { providerId: namespacedProvider, bareModelId } = this.parseModelId(modelId)
    const effectiveProviderId = (namespacedProvider ?? fallbackProviderId) as ProviderId
    const effectiveModelId = namespacedProvider ? bareModelId : modelId

    const provider = this.getProvider(effectiveProviderId, settings)

    if (!provider.textEmbeddingModel) {
      throw new ModelResolutionError(`Provider "${effectiveProviderId}" does not support embedding models`, {
        providerId: effectiveProviderId,
        modelId: effectiveModelId
      })
    }
    return provider.textEmbeddingModel(effectiveModelId)
  }

  // ── Resolve image model ──

  resolveImageModel(modelId: string, fallbackProviderId: string, settings: BaseProviderSettings): unknown {
    const { providerId: namespacedProvider, bareModelId } = this.parseModelId(modelId)
    const effectiveProviderId = (namespacedProvider ?? fallbackProviderId) as ProviderId
    const effectiveModelId = namespacedProvider ? bareModelId : modelId

    const provider = this.getProvider(effectiveProviderId, settings)

    if (!provider.image) {
      throw new ModelResolutionError(`Provider "${effectiveProviderId}" does not support image models`, {
        providerId: effectiveProviderId,
        modelId: effectiveModelId
      })
    }
    return provider.image(effectiveModelId)
  }
}

// Global singleton
export const modelResolver = new ModelResolver()
