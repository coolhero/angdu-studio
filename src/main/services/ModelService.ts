import type { Model } from '@shared/types/provider'
import type { ModelFetchResult } from '@shared/types/ai-core'
import { ProviderService } from './ProviderService'

export class ModelService {
  private static instance: ModelService
  private cacheTTL = 60 * 60 * 1000 // 1 hour
  private cacheTimestamps: Record<string, number> = {}

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService()
    }
    return ModelService.instance
  }

  async fetchModels(providerId: string): Promise<ModelFetchResult> {
    const providerService = ProviderService.getInstance()
    const provider = providerService.getProviderWithKey(providerId)
    if (!provider) throw new Error(`Provider not found: ${providerId}`)

    // Check cache freshness
    const lastFetch = this.cacheTimestamps[providerId] ?? 0
    if (Date.now() - lastFetch < this.cacheTTL && provider.models.length > 0) {
      return { models: provider.models, cached: true }
    }

    const apiKey = providerService.decryptKey(provider.apiKey)

    try {
      const { AICoreService } = await import('./AICoreService')
      const aiCore = AICoreService.getInstance()
      const models = await aiCore.listModels(provider, apiKey)

      // Update cache
      this.cacheTimestamps[providerId] = Date.now()
      providerService.updateModels(providerId, models)

      return { models, cached: false }
    } catch (err) {
      // On fetch failure, return cached if available
      if (provider.models.length > 0) {
        console.warn(`[ModelService] Fetch failed for ${providerId}, using cache:`, err)
        return { models: provider.models, cached: true }
      }
      throw err
    }
  }
}
