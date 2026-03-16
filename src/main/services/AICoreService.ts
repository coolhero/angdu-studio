import { BrowserWindow } from 'electron'
import type { Provider, Model, ProviderType } from '@shared/types/provider'
import type { ChatMessage, ChatOptions, NormalizedChunk, SerializedError } from '@shared/types/ai-core'
import { URL_TRANSFORM_RULES, isChatCapableModel } from '@shared/types/provider'

export class AICoreService {
  private static instance: AICoreService
  private abortControllers = new Map<string, AbortController>()

  static getInstance(): AICoreService {
    if (!AICoreService.instance) {
      AICoreService.instance = new AICoreService()
    }
    return AICoreService.instance
  }

  async testProvider(provider: Provider, apiKey: string): Promise<void> {
    // Quick connectivity test using the provider's model list endpoint
    await this.listModels(provider, apiKey)
  }

  async listModels(provider: Provider, apiKey: string): Promise<Model[]> {
    const sdkProvider = await this.createSdkProvider(provider.type, {
      apiKey,
      baseURL: this.transformUrl(provider.type, provider.apiHost)
    })

    // Use AI SDK's model listing capability
    try {
      // Most providers support the OpenAI-compatible /v1/models endpoint
      const url = new URL('/v1/models', this.transformUrl(provider.type, provider.apiHost))
      const headers: Record<string, string> = {
        ...this.getAuthHeaders(provider.type, apiKey),
        ...provider.extra_headers
      }

      const response = await fetch(url.toString(), { headers })
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const rawModels = data.data ?? data.models ?? []

      return rawModels.map((m: Record<string, unknown>) => {
        const id = (m.id ?? m.name ?? '') as string
        return {
          id,
          provider: provider.id,
          name: id,
          group: ((m.owned_by as string) ?? provider.name),
          capabilities: [],
          endpoint_type: this.inferEndpointType(provider.type),
          enabled: isChatCapableModel(id)
        }
      })
    } catch (err) {
      throw new Error(
        `Failed to fetch models from ${provider.name}: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    }
  }

  async chat(
    provider: Provider,
    apiKey: string,
    model: Model,
    messages: ChatMessage[],
    options: ChatOptions,
    window: BrowserWindow
  ): Promise<void> {
    const controller = new AbortController()
    this.abortControllers.set(options.requestId, controller)

    try {
      const { streamText } = await import('ai')
      const sdkModel = await this.createSdkModel(provider, apiKey, model)

      const result = streamText({
        model: sdkModel,
        messages: messages.map((m) => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
        })),
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        topP: options.topP,
        abortSignal: controller.signal
      })

      // AI SDK v4: streamText returns result directly (not a Promise)
      for await (const part of result.textStream) {
        if (controller.signal.aborted) break

        const chunk: NormalizedChunk = { type: 'text', content: part }
        window.webContents.send('ai:stream-chunk', {
          requestId: options.requestId,
          chunk
        })
      }

      // Get final usage after stream completes
      const usage = await result.usage

      window.webContents.send('ai:stream-complete', {
        requestId: options.requestId,
        usage: usage
          ? {
              promptTokens: usage.promptTokens,
              completionTokens: usage.completionTokens,
              totalTokens: usage.totalTokens
            }
          : undefined
      })
    } catch (err) {
      if (controller.signal.aborted) return

      console.error('[AICoreService] Chat error:', err)
      const serialized = this.serializeError(err, provider)
      window.webContents.send('ai:stream-error', {
        requestId: options.requestId,
        error: serialized
      })
    } finally {
      this.abortControllers.delete(options.requestId)
    }
  }

  abort(requestId: string): void {
    const controller = this.abortControllers.get(requestId)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(requestId)
    }
  }

  private async createSdkModel(provider: Provider, apiKey: string, model: Model) {
    const baseURL = this.transformUrl(provider.type, provider.apiHost)
    const opts = { apiKey, baseURL }

    switch (provider.type) {
      case 'openai':
      case 'new-api':
      case 'gateway':
      case 'ollama': {
        const { createOpenAI } = await import('@ai-sdk/openai')
        // Use .chat() to force /v1/chat/completions (not /responses)
        return createOpenAI(opts).chat(model.id)
      }
      case 'openai-response': {
        // Explicitly use OpenAI Responses API
        const { createOpenAI } = await import('@ai-sdk/openai')
        return createOpenAI(opts).responses(model.id)
      }
      case 'anthropic': {
        const { createAnthropic } = await import('@ai-sdk/anthropic')
        return createAnthropic(opts)(model.id)
      }
      case 'gemini': {
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google')
        return createGoogleGenerativeAI({ apiKey })(model.id)
      }
      case 'azure-openai': {
        const { createAzure } = await import('@ai-sdk/azure')
        return createAzure({ apiKey, baseURL })(model.id)
      }
      case 'mistral': {
        const { createMistral } = await import('@ai-sdk/mistral')
        return createMistral(opts)(model.id)
      }
      case 'aws-bedrock': {
        const { createAmazonBedrock } = await import('@ai-sdk/amazon-bedrock')
        return createAmazonBedrock({})(model.id)
      }
      default: {
        // Fallback to OpenAI-compatible chat completions
        const { createOpenAI } = await import('@ai-sdk/openai')
        return createOpenAI(opts).chat(model.id)
      }
    }
  }

  private async createSdkProvider(
    type: ProviderType,
    opts: { apiKey: string; baseURL: string }
  ) {
    // Simplified — just needed for type narrowing
    return { type, opts }
  }

  private transformUrl(type: ProviderType, url: string): string {
    if (!url) return url
    // Strip trailing slash first
    const normalized = url.replace(/\/+$/, '')
    const transform = URL_TRANSFORM_RULES[type]
    const transformed = transform ? transform(normalized) : normalized

    // For OpenAI-compatible providers: ensure /v1 suffix for chat completions
    if (
      (type === 'openai' || type === 'new-api' || type === 'gateway') &&
      !transformed.endsWith('/v1') &&
      !transformed.includes('/v1/')
    ) {
      return `${transformed}/v1`
    }
    return transformed
  }

  private getAuthHeaders(type: ProviderType, apiKey: string): Record<string, string> {
    if (!apiKey) return {}
    switch (type) {
      case 'anthropic':
        return { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
      case 'azure-openai':
        return { 'api-key': apiKey }
      default:
        return { Authorization: `Bearer ${apiKey}` }
    }
  }

  private inferEndpointType(type: ProviderType): import('@shared/types/provider').EndpointType {
    switch (type) {
      case 'anthropic':
      case 'vertex-anthropic':
        return 'anthropic'
      case 'gemini':
        return 'gemini'
      default:
        return 'openai'
    }
  }

  private serializeError(err: unknown, provider: Provider): SerializedError {
    if (err instanceof Error) {
      const statusMatch = err.message.match(/(\d{3})/)
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined

      let code = 'UNKNOWN'
      if (statusCode === 401 || statusCode === 403) code = 'AUTH_ERROR'
      else if (statusCode === 429) code = 'RATE_LIMIT'
      else if (statusCode === 404) code = 'MODEL_NOT_FOUND'
      else if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT'))
        code = 'NETWORK_ERROR'

      return {
        code,
        message: err.message,
        provider: provider.name,
        statusCode
      }
    }
    return { code: 'UNKNOWN', message: String(err), provider: provider.name }
  }
}
