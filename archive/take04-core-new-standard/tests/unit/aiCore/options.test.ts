import { describe, it, expect } from 'vitest'
import {
  createOpenAIOptions,
  createAnthropicOptions,
  createGoogleOptions,
  createOpenRouterOptions,
  createXaiOptions,
  createGenericProviderOptions,
  mergeProviderOptions
} from '@aiCore/core/options/builders'

describe('Options Builders', () => {
  it('createOpenAIOptions should produce typed openai options', () => {
    const opts = createOpenAIOptions({ temperature: 0.7, maxTokens: 4096 })
    expect(opts.provider).toBe('openai')
    expect(opts.options).toEqual({ temperature: 0.7, maxTokens: 4096 })
  })

  it('createAnthropicOptions should include cache control', () => {
    const opts = createAnthropicOptions({ cacheControl: { type: 'ephemeral' }, maxTokens: 8192 })
    expect(opts.provider).toBe('anthropic')
    expect(opts.options).toEqual({ cacheControl: { type: 'ephemeral' }, maxTokens: 8192 })
  })

  it('createGoogleOptions should include safety settings', () => {
    const opts = createGoogleOptions({ temperature: 0.5, safetySettings: [] })
    expect(opts.provider).toBe('google')
    expect(opts.options.temperature).toBe(0.5)
  })

  it('createOpenRouterOptions should include transforms', () => {
    const opts = createOpenRouterOptions({ transforms: ['middle-out'], temperature: 0.8 })
    expect(opts.provider).toBe('openrouter')
    expect(opts.options).toEqual({ transforms: ['middle-out'], temperature: 0.8 })
  })

  it('createXaiOptions should produce typed xai options', () => {
    const opts = createXaiOptions({ temperature: 0.3, maxTokens: 2048 })
    expect(opts.provider).toBe('xai')
    expect(opts.options).toEqual({ temperature: 0.3, maxTokens: 2048 })
  })

  it('createGenericProviderOptions should work for any provider', () => {
    const opts = createGenericProviderOptions('custom', { foo: 'bar' })
    expect(opts.provider).toBe('custom')
    expect(opts.options).toEqual({ foo: 'bar' })
  })

  describe('mergeProviderOptions', () => {
    it('should deep merge multiple option objects', () => {
      const a = createOpenAIOptions({ temperature: 0.5 })
      const b = createOpenAIOptions({ maxTokens: 1024 })
      const merged = mergeProviderOptions(a, b)
      expect(merged.options).toEqual({ temperature: 0.5, maxTokens: 1024 })
    })

    it('should use last provider name', () => {
      const a = createOpenAIOptions({ temperature: 0.5 })
      const b = createAnthropicOptions({ maxTokens: 1024 })
      const merged = mergeProviderOptions(a, b)
      expect(merged.provider).toBe('anthropic')
    })

    it('should deep merge nested objects', () => {
      const a = createAnthropicOptions({ cacheControl: { type: 'ephemeral' } })
      const b = { provider: 'anthropic', options: { cacheControl: { type: 'persistent' }, maxTokens: 100 } }
      const merged = mergeProviderOptions(a, b)
      expect(merged.options.cacheControl).toEqual({ type: 'persistent' })
      expect(merged.options.maxTokens).toBe(100)
    })

    it('should handle empty options list', () => {
      const merged = mergeProviderOptions()
      expect(merged.provider).toBe('unknown')
      expect(merged.options).toEqual({})
    })

    it('should handle single options', () => {
      const a = createOpenAIOptions({ temperature: 0.7 })
      const merged = mergeProviderOptions(a)
      expect(merged).toBe(a)
    })
  })
})
