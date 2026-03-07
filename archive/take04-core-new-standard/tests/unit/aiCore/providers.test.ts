import { describe, it, expect } from 'vitest'
import { getProviderFactory, PROVIDER_FACTORY_REGISTRY } from '@aiCore/core/providers/registry'

describe('Provider Factory Registry', () => {
  it('should have factories for all built-in providers', () => {
    const providers = ['openai', 'anthropic', 'google', 'openrouter', 'xai', 'azure', 'deepseek', 'openai-compatible'] as const
    for (const id of providers) {
      expect(PROVIDER_FACTORY_REGISTRY[id]).toBeDefined()
    }
  })

  it('should resolve openai provider factory', () => {
    const factory = getProviderFactory('openai')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key' })
    expect(provider).toBeDefined()
  })

  it('should resolve anthropic provider factory', () => {
    const factory = getProviderFactory('anthropic')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key' })
    expect(provider).toBeDefined()
  })

  it('should resolve google provider factory', () => {
    const factory = getProviderFactory('google')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key' })
    expect(provider).toBeDefined()
  })

  it('should resolve xai provider factory', () => {
    const factory = getProviderFactory('xai')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key' })
    expect(provider).toBeDefined()
  })

  it('should resolve azure provider factory', () => {
    const factory = getProviderFactory('azure')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key' })
    expect(provider).toBeDefined()
  })

  it('should resolve deepseek provider via openai factory with baseURL', () => {
    const factory = getProviderFactory('deepseek')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key', baseURL: 'https://api.deepseek.com/v1' })
    expect(provider).toBeDefined()
  })

  it('should resolve openrouter provider via openai factory', () => {
    const factory = getProviderFactory('openrouter')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key', baseURL: 'https://openrouter.ai/api/v1' })
    expect(provider).toBeDefined()
  })

  it('should resolve openai-compatible provider', () => {
    const factory = getProviderFactory('openai-compatible')
    expect(factory).toBeDefined()
    const provider = factory({ apiKey: 'test-key', baseURL: 'https://custom.api/v1' })
    expect(provider).toBeDefined()
  })

  it('should throw for unknown provider', () => {
    expect(() => getProviderFactory('unknown' as never)).toThrow('Unknown provider')
  })
})
