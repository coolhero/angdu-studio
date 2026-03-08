import { definePlugin } from './PluginBuilder'
import type { PluginContext, AICoreResult } from '../../types/ai-core'

export const telemetryPlugin = definePlugin(
  'telemetry',
  {
    onRequestStart: (ctx: PluginContext) => {
      ctx._telemetryStartTime = Date.now()
    },
    onRequestEnd: (result: AICoreResult, ctx: PluginContext) => {
      const startTime = ctx._telemetryStartTime as number | undefined
      if (startTime) {
        const duration = Date.now() - startTime
        console.debug(
          `[telemetry] ${ctx.provider.type}/${ctx.model.id}: ${duration}ms, ` +
          `input=${result.usage?.inputTokens ?? 0}, output=${result.usage?.outputTokens ?? 0}`
        )
      }
    }
  },
  'post'
)
