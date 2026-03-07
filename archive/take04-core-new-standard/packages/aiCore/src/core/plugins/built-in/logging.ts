// Logging Plugin (F003)

import type { AiPlugin, AiRequestContext } from '../types'

export interface LoggingPluginOptions {
  level?: 'debug' | 'info' | 'warn' | 'error'
  logParams?: boolean
  logResult?: boolean
  logger?: {
    debug: (...args: unknown[]) => void
    info: (...args: unknown[]) => void
    warn: (...args: unknown[]) => void
    error: (...args: unknown[]) => void
  }
}

export function createLoggingPlugin(options: LoggingPluginOptions = {}): AiPlugin {
  const { level = 'info', logParams = false, logResult = false, logger = console } = options

  const log = logger[level].bind(logger)

  return {
    name: 'ai-core:logging',
    enforce: 'pre',

    onRequestStart(context: AiRequestContext) {
      log(`[aiCore] Request started`, {
        requestId: context.requestId,
        providerId: context.providerId,
        ...(logParams ? { params: context.originalParams } : {})
      })
    },

    onRequestEnd(context: AiRequestContext, result: unknown) {
      const duration = Date.now() - context.startTime
      log(`[aiCore] Request completed`, {
        requestId: context.requestId,
        providerId: context.providerId,
        durationMs: duration,
        ...(logResult ? { result } : {})
      })
    },

    onError(error: Error, context: AiRequestContext) {
      const duration = Date.now() - context.startTime
      logger.error(`[aiCore] Request failed`, {
        requestId: context.requestId,
        providerId: context.providerId,
        durationMs: duration,
        error: error.message
      })
    }
  }
}
