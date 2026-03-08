import { definePlugin } from './PluginBuilder'
import type { PluginContext } from '../../types/ai-core'

export const simulateStreamingPlugin = definePlugin(
  'simulateStreaming',
  {
    configureContext: (ctx: PluginContext) => {
      const supportsStreaming = ctx.provider.apiOptions?.streamOutput !== false
      return {
        ...ctx,
        simulateStreaming: !supportsStreaming
      }
    }
  },
  'pre'
)
