import { definePlugin } from './PluginBuilder'
import type { AICoreParams, PluginContext } from '../../types/ai-core'

export const anthropicCachePlugin = definePlugin(
  'anthropicCache',
  {
    transformParams: (params: AICoreParams, ctx: PluginContext) => {
      const { provider } = ctx

      // Only apply to Anthropic providers with cache enabled
      if (
        (provider.type !== 'anthropic' && provider.type !== 'vertex-anthropic') ||
        !provider.anthropicCacheControl?.enabled
      ) {
        return params
      }

      return {
        ...params,
        providerOptions: {
          ...params.providerOptions,
          anthropic: {
            ...(params.providerOptions?.anthropic as Record<string, unknown> ?? {}),
            cacheControl: { type: provider.anthropicCacheControl.cacheType }
          }
        }
      }
    }
  },
  'pre'
)
