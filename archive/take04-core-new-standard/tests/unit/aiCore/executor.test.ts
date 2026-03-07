import { describe, it, expect, vi } from 'vitest'
import { RuntimeExecutor } from '@aiCore/core/runtime/executor'
import { definePlugin } from '@aiCore/core/plugins'
import { ParameterValidationError } from '@aiCore/core/errors'

// Mock AI SDK
vi.mock('ai', () => ({
  streamText: vi.fn(async ({ model, messages }) => {
    const chunks = ['Hello', ' ', 'World']
    return {
      textStream: (async function* () {
        for (const chunk of chunks) yield chunk
      })(),
      text: Promise.resolve('Hello World'),
      usage: Promise.resolve({ promptTokens: 10, completionTokens: 5 }),
      finishReason: Promise.resolve('stop')
    }
  }),
  generateText: vi.fn(async ({ model, messages }) => ({
    text: 'Generated response',
    usage: { promptTokens: 10, completionTokens: 5 },
    finishReason: 'stop'
  })),
  wrapLanguageModel: vi.fn(({ model }) => model)
}))

// Mock provider factories
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => {
    const provider = (modelId: string) => ({
      modelId,
      provider: 'openai',
      specificationVersion: 'v1',
      doGenerate: vi.fn(),
      doStream: vi.fn()
    })
    provider.languageModel = provider
    return provider
  })
}))

describe('RuntimeExecutor', () => {
  const settings = { apiKey: 'test-key' }

  describe('streamText', () => {
    it('should stream text tokens', async () => {
      const executor = RuntimeExecutor.create('openai', settings)
      const result = await executor.streamText({
        model: 'gpt-4.1',
        messages: [{ role: 'user' as const, content: 'Hello!' }]
      })
      expect(result).toBeDefined()
      expect(result.textStream).toBeDefined()
    })

    it('should throw ParameterValidationError when model is empty', async () => {
      const executor = RuntimeExecutor.create('openai', settings)
      await expect(
        executor.streamText({
          model: '',
          messages: [{ role: 'user' as const, content: 'Hello!' }]
        })
      ).rejects.toThrow(ParameterValidationError)
    })

    it('should fire plugin hooks during streaming', async () => {
      const hookLog: string[] = []
      const plugin = definePlugin({
        name: 'test-hook-logger',
        configureContext: () => {
          hookLog.push('configureContext')
        },
        onRequestStart: () => {
          hookLog.push('onRequestStart')
        },
        onRequestEnd: () => {
          hookLog.push('onRequestEnd')
        },
        transformParams: (params) => {
          hookLog.push('transformParams')
          return params
        }
      })

      const executor = RuntimeExecutor.create('openai', settings, [plugin])
      await executor.streamText({
        model: 'gpt-4.1',
        messages: [{ role: 'user' as const, content: 'Test' }]
      })

      expect(hookLog).toContain('configureContext')
      expect(hookLog).toContain('onRequestStart')
      expect(hookLog).toContain('transformParams')
      expect(hookLog).toContain('onRequestEnd')
    })
  })

  describe('generateText', () => {
    it('should return complete text result', async () => {
      const executor = RuntimeExecutor.create('openai', settings)
      const result = await executor.generateText({
        model: 'gpt-4.1',
        messages: [{ role: 'user' as const, content: 'Summarize.' }]
      })
      expect(result).toBeDefined()
      expect(result.text).toBe('Generated response')
    })

    it('should apply transformResult plugins', async () => {
      const plugin = definePlugin({
        name: 'test-transform',
        transformResult: (result: any) => ({
          ...result,
          text: result.text + ' [transformed]'
        })
      })

      const executor = RuntimeExecutor.create('openai', settings, [plugin])
      const result = await executor.generateText({
        model: 'gpt-4.1',
        messages: [{ role: 'user' as const, content: 'Test' }]
      })
      expect(result.text).toBe('Generated response [transformed]')
    })
  })

  describe('static factories', () => {
    it('should create executor via create()', () => {
      const executor = RuntimeExecutor.create('openai', settings)
      expect(executor).toBeInstanceOf(RuntimeExecutor)
    })

    it('should create openai-compatible executor', () => {
      const executor = RuntimeExecutor.createOpenAICompatible({
        apiKey: 'test',
        baseURL: 'https://custom.api/v1'
      })
      expect(executor).toBeInstanceOf(RuntimeExecutor)
    })
  })

  describe('error propagation', () => {
    it('should fire onError hook when execution fails', async () => {
      const { streamText: mockStreamText } = await import('ai')
      vi.mocked(mockStreamText).mockRejectedValueOnce(new Error('API Error'))

      let capturedError: Error | null = null
      const plugin = definePlugin({
        name: 'error-catcher',
        onError: (error) => {
          capturedError = error
        }
      })

      const executor = RuntimeExecutor.create('openai', settings, [plugin])
      await expect(
        executor.streamText({
          model: 'gpt-4.1',
          messages: [{ role: 'user' as const, content: 'Test' }]
        })
      ).rejects.toThrow('API Error')

      expect(capturedError).toBeDefined()
      expect(capturedError!.message).toBe('API Error')
    })
  })
})
