import { definePlugin } from './PluginBuilder'
import { isReasoningModel } from '../prepareParams/modelCapabilities'
import type { AICoreParams, PluginContext } from '../../types/ai-core'

export const reasoningExtractionPlugin = definePlugin(
  'reasoningExtraction',
  {
    configureContext: (ctx) => {
      return {
        ...ctx,
        extractReasoning: isReasoningModel(ctx.model)
      }
    },
    transformParams: (params: AICoreParams, ctx: PluginContext) => {
      if (!ctx.extractReasoning) return params

      // For providers that need explicit reasoning enablement
      if (ctx.provider.type === 'anthropic' || ctx.provider.type === 'vertex-anthropic') {
        return {
          ...params,
          providerOptions: {
            ...params.providerOptions,
            anthropic: {
              ...(params.providerOptions?.anthropic as Record<string, unknown> ?? {}),
              thinking: { type: 'enabled', budgetTokens: params.maxTokens ?? 10000 }
            }
          }
        }
      }

      return params
    }
  },
  'pre'
)
