// RuntimeExecutor — core execution engine (F003)

import {
  streamText as aiStreamText,
  generateText as aiGenerateText,
  type StreamTextResult,
  type GenerateTextResult,
  type LanguageModelV1 as LanguageModel,
  type CoreMessage
} from 'ai'
import type { ProviderId, ProviderSettingsMap, AiSdkLanguageModel } from '../../types'
import type { AiPlugin, AiRequestContext, AiRequestMetadata } from '../plugins/types'
import { PluginEngine } from './pluginEngine'
import { ModelResolver } from '../models/ModelResolver'
import { wrapModelWithMiddlewares } from '../middleware'
import { ParameterValidationError } from '../errors'

// ── Request parameter types ──

export interface StreamTextParams {
  model: string
  messages: CoreMessage[]
  system?: string
  maxTokens?: number
  temperature?: number
  topP?: number
  topK?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]
  tools?: Record<string, unknown>
  toolChoice?: unknown
  providerOptions?: Record<string, unknown>
  metadata?: AiRequestMetadata
  abortSignal?: AbortSignal
}

export interface GenerateTextParams extends StreamTextParams {}

export interface GenerateImageParams {
  model: string
  prompt: string
  n?: number
  size?: string
  providerOptions?: Record<string, unknown>
  metadata?: AiRequestMetadata
}

export class RuntimeExecutor<T extends ProviderId = ProviderId> {
  private readonly providerId: T
  private readonly providerSettings: ProviderSettingsMap[T]
  private readonly pluginEngine: PluginEngine
  private readonly modelResolver: ModelResolver

  constructor(providerId: T, providerSettings: ProviderSettingsMap[T], plugins: AiPlugin[] = []) {
    this.providerId = providerId
    this.providerSettings = providerSettings
    this.pluginEngine = new PluginEngine(plugins)
    this.modelResolver = new ModelResolver()
  }

  // ── Stream text ──

  async streamText(params: StreamTextParams): Promise<StreamTextResult<Record<string, unknown>, unknown>> {
    if (!params.model) {
      throw new ParameterValidationError('model is required', { params })
    }

    const languageModel = this.resolveModel(params.model)

    return this.pluginEngine.executeStreamWithPlugins<StreamTextParams, StreamTextResult<Record<string, unknown>, unknown>>(
      this.providerId,
      languageModel,
      params,
      async (transformedParams, ctx) => {
        const model = this.applyMiddlewares(ctx.model as AiSdkLanguageModel, ctx)
        return aiStreamText({
          model,
          messages: transformedParams.messages,
          system: transformedParams.system,
          maxTokens: transformedParams.maxTokens,
          temperature: transformedParams.temperature,
          topP: transformedParams.topP,
          topK: transformedParams.topK,
          frequencyPenalty: transformedParams.frequencyPenalty,
          presencePenalty: transformedParams.presencePenalty,
          stopSequences: transformedParams.stopSequences,
          providerOptions: transformedParams.providerOptions,
          abortSignal: transformedParams.abortSignal
        }) as unknown as StreamTextResult<Record<string, unknown>, unknown>
      },
      params.metadata
    )
  }

  // ── Generate text (non-streaming) ──

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult<Record<string, unknown>, unknown>> {
    if (!params.model) {
      throw new ParameterValidationError('model is required', { params })
    }

    const languageModel = this.resolveModel(params.model)

    return this.pluginEngine.executeWithPlugins<GenerateTextParams, GenerateTextResult<Record<string, unknown>, unknown>>(
      this.providerId,
      languageModel,
      params,
      async (transformedParams, ctx) => {
        const model = this.applyMiddlewares(ctx.model as AiSdkLanguageModel, ctx)
        return aiGenerateText({
          model,
          messages: transformedParams.messages,
          system: transformedParams.system,
          maxTokens: transformedParams.maxTokens,
          temperature: transformedParams.temperature,
          topP: transformedParams.topP,
          topK: transformedParams.topK,
          frequencyPenalty: transformedParams.frequencyPenalty,
          presencePenalty: transformedParams.presencePenalty,
          stopSequences: transformedParams.stopSequences,
          providerOptions: transformedParams.providerOptions,
          abortSignal: transformedParams.abortSignal
        }) as unknown as GenerateTextResult<Record<string, unknown>, unknown>
      },
      params.metadata
    )
  }

  // ── Generate image ──

  async generateImage(params: GenerateImageParams): Promise<unknown> {
    if (!params.model) {
      throw new ParameterValidationError('model is required', { params })
    }

    const imageModel = this.modelResolver.resolveImageModel(params.model, this.providerId, this.providerSettings)

    return this.pluginEngine.executeWithPlugins(
      this.providerId,
      imageModel as never,
      params,
      async () => {
        // Image generation delegates to provider-specific implementation
        throw new Error('Image generation requires provider-specific implementation')
      },
      params.metadata
    )
  }

  // ── Plugin management ──

  use(plugin: AiPlugin): this {
    this.pluginEngine.use(plugin)
    return this
  }

  // ── Resolve model helper ──

  private resolveModel(modelId: string): LanguageModel {
    return this.modelResolver.resolveLanguageModel(modelId, this.providerId, this.providerSettings)
  }

  // ── Apply middlewares from context ──

  private applyMiddlewares(model: AiSdkLanguageModel, ctx: AiRequestContext): LanguageModel {
    if (ctx.middlewares.length === 0) return model
    return wrapModelWithMiddlewares(model, ctx.middlewares)
  }

  // ── Static factories ──

  static create<P extends ProviderId>(providerId: P, settings: ProviderSettingsMap[P], plugins?: AiPlugin[]): RuntimeExecutor<P> {
    return new RuntimeExecutor(providerId, settings, plugins)
  }

  static createOpenAICompatible(settings: ProviderSettingsMap['openai-compatible'], plugins?: AiPlugin[]): RuntimeExecutor<'openai-compatible'> {
    return new RuntimeExecutor('openai-compatible', settings, plugins)
  }
}
