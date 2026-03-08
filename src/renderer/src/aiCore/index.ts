import { streamText, generateText } from 'ai'
import type { Provider, Model } from '../types/provider'
import type {
  AICoreParams,
  AICoreResult,
  PluginContext,
  OnChunkCallback,
  StreamChunk
} from '../types/ai-core'
import { resolveProviderClient } from './provider/factory'
import { buildStreamTextParams, type ParamBuildInput } from './prepareParams/parameterBuilder'
import { createChunkProcessor } from './chunk/chunkProcessor'
import { PluginPipeline } from './plugins/PluginBuilder'
import { reasoningExtractionPlugin } from './plugins/reasoningExtractionPlugin'
import { anthropicCachePlugin } from './plugins/anthropicCachePlugin'
import { simulateStreamingPlugin } from './plugins/simulateStreamingPlugin'
import { telemetryPlugin } from './plugins/telemetryPlugin'
import { noThinkPlugin } from './plugins/noThinkPlugin'

// ── Default Plugin Pipeline ──

function createDefaultPipeline(): PluginPipeline {
  const pipeline = new PluginPipeline()
  pipeline.register(reasoningExtractionPlugin)
  pipeline.register(anthropicCachePlugin)
  pipeline.register(simulateStreamingPlugin)
  pipeline.register(noThinkPlugin)
  pipeline.register(telemetryPlugin)
  return pipeline
}

// ── AI Core: Streaming Completion ──

export interface StreamCompletionInput extends Omit<ParamBuildInput, 'provider' | 'model'> {
  provider: Provider
  model: Model
  onChunk: OnChunkCallback
  pipeline?: PluginPipeline
}

export async function streamCompletion(input: StreamCompletionInput): Promise<AICoreResult> {
  const { provider, model, onChunk, pipeline: customPipeline, ...paramInput } = input
  const pipeline = customPipeline ?? createDefaultPipeline()

  // 1. Create plugin context
  let ctx: PluginContext = {
    provider,
    model,
    abortSignal: paramInput.abortSignal
  }
  ctx = pipeline.configureContext(ctx)

  // 2. Notify plugins of request start
  await pipeline.onRequestStart(ctx)

  // 3. Build and transform parameters
  let params = buildStreamTextParams({ provider, model, ...paramInput })
  params = pipeline.transformParams(params, ctx)

  // 4. Resolve provider SDK client
  const client = resolveProviderClient(provider)

  // 5. Create chunk processor
  const processor = createChunkProcessor(onChunk)

  // 6. Check if we should simulate streaming
  const shouldSimulate = ctx.simulateStreaming === true

  if (shouldSimulate) {
    // Non-streaming: generate full text, then simulate streaming
    const result = await generateText({
      model: client(params.model),
      messages: params.messages as Parameters<typeof generateText>[0]['messages'],
      temperature: params.temperature,
      topK: params.topK,
      topP: params.topP,
      frequencyPenalty: params.frequencyPenalty,
      presencePenalty: params.presencePenalty,
      maxTokens: params.maxTokens,
      stopSequences: params.stopSequences,
      seed: params.seed,
      headers: params.headers,
      abortSignal: params.abortSignal
    })

    // Simulate streaming by chunking the response
    const text = result.text
    const chunkSize = 4
    for (let i = 0; i < text.length; i += chunkSize) {
      processor.process({
        type: 'text-delta',
        content: text.slice(i, i + chunkSize)
      })
    }

    processor.process({
      type: 'usage',
      usage: {
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
        totalTokens: result.usage.promptTokens + result.usage.completionTokens
      }
    })

    processor.process({ type: 'finish', finishReason: result.finishReason })
  } else {
    // Streaming: use streamText
    const stream = streamText({
      model: client(params.model),
      messages: params.messages as Parameters<typeof streamText>[0]['messages'],
      temperature: params.temperature,
      topK: params.topK,
      topP: params.topP,
      frequencyPenalty: params.frequencyPenalty,
      presencePenalty: params.presencePenalty,
      maxTokens: params.maxTokens,
      stopSequences: params.stopSequences,
      seed: params.seed,
      headers: params.headers,
      tools: params.tools as Parameters<typeof streamText>[0]['tools'],
      abortSignal: params.abortSignal
    })

    for await (const part of stream.fullStream) {
      const chunk = mapStreamPart(part)
      if (chunk) processor.process(chunk)
    }

    // Get final usage
    const usage = await stream.usage
    if (usage) {
      processor.process({
        type: 'usage',
        usage: {
          inputTokens: usage.promptTokens,
          outputTokens: usage.completionTokens,
          totalTokens: usage.promptTokens + usage.completionTokens
        }
      })
    }

    const finishReason = await stream.finishReason
    processor.process({ type: 'finish', finishReason: finishReason ?? 'stop' })
  }

  // 7. Build result
  const finalState = processor.getState()
  const result: AICoreResult = {
    text: finalState.blocks
      .filter((b) => b.type === 'text')
      .map((b) => b.content)
      .join(''),
    blocks: finalState.blocks,
    usage: finalState.usage,
    finishReason: finalState.finishReason
  }

  // 8. Notify plugins of request end
  await pipeline.onRequestEnd(result, ctx)

  return result
}

// ── Stream Part Mapping ──

function mapStreamPart(part: { type: string; [key: string]: unknown }): StreamChunk | null {
  switch (part.type) {
    case 'text-delta':
      return { type: 'text-delta', content: part.textDelta as string }

    case 'reasoning':
      return { type: 'reasoning-delta', content: part.textDelta as string }

    case 'tool-call':
      return {
        type: 'tool-call',
        toolCallId: part.toolCallId as string,
        toolName: part.toolName as string,
        args: part.args as Record<string, unknown>
      }

    case 'tool-result':
      return {
        type: 'tool-result',
        toolCallId: part.toolCallId as string,
        result: part.result
      }

    case 'error':
      return { type: 'error', error: String(part.error) }

    default:
      return null
  }
}

// Re-export for convenience
export { resolveProviderClient } from './provider/factory'
export { PluginPipeline, definePlugin } from './plugins/PluginBuilder'
export type { ParamBuildInput } from './prepareParams/parameterBuilder'
