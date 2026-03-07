import { describe, it, expect, vi } from 'vitest'
import { ModelResolver } from '@aiCore/core/models/ModelResolver'

// Mock the provider factories since we don't want real API calls
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => {
    const provider = (modelId: string) => ({ modelId, provider: 'openai', specificationVersion: 'v1' })
    provider.languageModel = (modelId: string) => ({ modelId, provider: 'openai', specificationVersion: 'v1' })
    provider.textEmbeddingModel = (modelId: string) => ({ modelId, provider: 'openai-embedding', specificationVersion: 'v1' })
    provider.image = (modelId: string) => ({ modelId, provider: 'openai-image', specificationVersion: 'v1' })
    return provider
  })
}))

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(() => {
    const provider = (modelId: string) => ({ modelId, provider: 'anthropic', specificationVersion: 'v1' })
    provider.languageModel = (modelId: string) => ({ modelId, provider: 'anthropic', specificationVersion: 'v1' })
    return provider
  })
}))

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => {
    const provider = (modelId: string) => ({ modelId, provider: 'google', specificationVersion: 'v1' })
    provider.languageModel = (modelId: string) => ({ modelId, provider: 'google', specificationVersion: 'v1' })
    provider.textEmbeddingModel = (modelId: string) => ({ modelId, provider: 'google-embedding', specificationVersion: 'v1' })
    return provider
  })
}))

describe('ModelResolver', () => {
  it('should resolve traditional format model', () => {
    const resolver = new ModelResolver()
    const model = resolver.resolveLanguageModel('gpt-4.1', 'openai', { apiKey: 'test' })
    expect(model).toBeDefined()
    expect((model as any).modelId).toBe('gpt-4.1')
  })

  it('should resolve namespaced format model (provider:model)', () => {
    const resolver = new ModelResolver()
    const model = resolver.resolveLanguageModel('openai:gpt-4.1', 'anthropic', { apiKey: 'test' })
    expect(model).toBeDefined()
    // Namespaced format should use the provider from the model ID, not the fallback
    expect((model as any).modelId).toBe('gpt-4.1')
    expect((model as any).provider).toBe('openai')
  })

  it('should use fallback provider for traditional format', () => {
    const resolver = new ModelResolver()
    const model = resolver.resolveLanguageModel('claude-sonnet-4-20250514', 'anthropic', { apiKey: 'test' })
    expect(model).toBeDefined()
    expect((model as any).modelId).toBe('claude-sonnet-4-20250514')
    expect((model as any).provider).toBe('anthropic')
  })

  it('should throw for unknown provider in namespaced format', () => {
    const resolver = new ModelResolver()
    expect(() => resolver.resolveLanguageModel('unknown-provider:model', 'openai', { apiKey: 'test' })).toThrow()
  })

  it('should resolve embedding model', () => {
    const resolver = new ModelResolver()
    const model = resolver.resolveTextEmbeddingModel('text-embedding-3-small', 'openai', { apiKey: 'test' })
    expect(model).toBeDefined()
  })
})
