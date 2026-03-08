import { definePlugin } from './PluginBuilder'
import type { AICoreParams, PluginContext } from '../../types/ai-core'
import { isReasoningModel } from '../prepareParams/modelCapabilities'

export const noThinkPlugin = definePlugin(
  'noThink',
  {
    transformParams: (params: AICoreParams, ctx: PluginContext) => {
      // If the model supports reasoning but reasoning is NOT requested,
      // disable thinking to save tokens
      if (isReasoningModel(ctx.model) && !ctx.extractReasoning) {
        // For Qwen models, set enableThinking to false
        if (ctx.model.id.startsWith('qwen') || ctx.model.id.startsWith('Qwen')) {
          return {
            ...params,
            providerOptions: {
              ...params.providerOptions,
              openai: {
                ...(params.providerOptions?.openai as Record<string, unknown> ?? {}),
                enableThinking: false
              }
            }
          }
        }
      }
      return params
    }
  },
  'pre'
)
