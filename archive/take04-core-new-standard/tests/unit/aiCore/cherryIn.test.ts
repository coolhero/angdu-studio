import { describe, it, expect, vi } from 'vitest'

// Mock providers
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => {
    const provider = (modelId: string) => ({ modelId, provider: 'openai', specificationVersion: 'v1' })
    provider.languageModel = (modelId: string) => ({ modelId, provider: 'openai-lm', specificationVersion: 'v1' })
    provider.textEmbeddingModel = (modelId: string) => ({ modelId, provider: 'openai-embed', specificationVersion: 'v1' })
    provider.image = (modelId: string) => ({ modelId, provider: 'openai-image', specificationVersion: 'v1' })
    return provider
  })
}))

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(() => {
    const provider = (modelId: string) => ({ modelId, provider: 'anthropic', specificationVersion: 'v1' })
    provider.languageModel = (modelId: string) => ({ modelId, provider: 'anthropic-lm', specificationVersion: 'v1' })
    return provider
  })
}))

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => {
    const provider = (modelId: string) => ({ modelId, provider: 'google', specificationVersion: 'v1' })
    provider.languageModel = (modelId: string) => ({ modelId, provider: 'google-lm', specificationVersion: 'v1' })
    return provider
  })
}))

import { createCherryIn } from '@ai-sdk-provider/index'

describe('CherryIN Provider', () => {
  it('should create provider with default openai endpoint', () => {
    const provider = createCherryIn({ apiKey: 'test' })
    expect(provider).toBeDefined()
    expect(typeof provider).toBe('function')
    expect(typeof provider.languageModel).toBe('function')
    expect(typeof provider.chat).toBe('function')
    expect(typeof provider.embedding).toBe('function')
    expect(typeof provider.image).toBe('function')
  })

  it('should route to openai backend by default', () => {
    const provider = createCherryIn({ apiKey: 'test', endpointType: 'openai' })
    const model = provider.languageModel('gpt-4.1') as any
    expect(model.provider).toBe('openai-lm')
  })

  it('should route to anthropic backend', () => {
    const provider = createCherryIn({ apiKey: 'test', endpointType: 'anthropic' })
    const model = provider.languageModel('claude-3') as any
    expect(model.provider).toBe('anthropic-lm')
  })

  it('should route to google backend', () => {
    const provider = createCherryIn({ apiKey: 'test', endpointType: 'gemini' })
    const model = provider.languageModel('gemini-pro') as any
    expect(model.provider).toBe('google-lm')
  })

  it('should resolve embedding via openai-compatible endpoint', () => {
    const provider = createCherryIn({ apiKey: 'test' })
    const model = provider.embedding('text-embedding-3-small') as any
    expect(model.provider).toBe('openai-embed')
  })

  it('should be callable directly as a function', () => {
    const provider = createCherryIn({ apiKey: 'test' })
    const model = provider('gpt-4.1') as any
    expect(model).toBeDefined()
    expect(model.modelId).toBe('gpt-4.1')
  })

  it('should use custom baseURL', async () => {
    const { createOpenAI } = await import('@ai-sdk/openai')
    const spy = vi.mocked(createOpenAI)
    spy.mockClear()

    createCherryIn({ apiKey: 'test', baseURL: 'https://custom.api.com/v1' })
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: 'https://custom.api.com/v1' })
    )
  })
})
