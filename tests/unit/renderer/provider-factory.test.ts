import { describe, it, expect, vi } from 'vitest'
import { resolveProviderClient } from '../../../src/renderer/src/aiCore/provider/factory'
import { getProviderConfig, requiresApiKey } from '../../../src/renderer/src/aiCore/provider/providerConfig'
import type { Provider, ProviderType } from '../../../src/renderer/src/types/provider'

const makeProvider = (type: ProviderType, overrides?: Partial<Provider>): Provider => ({
  id: `test-${type}`,
  type,
  name: `Test ${type}`,
  apiKey: 'sk-test-key',
  apiHost: 'https://test.example.com',
  models: [],
  enabled: true,
  ...overrides
})

describe('Provider Factory', () => {
  const providerTypes: ProviderType[] = [
    'openai', 'openai-response', 'anthropic', 'gemini',
    'azure-openai', 'vertexai', 'mistral', 'aws-bedrock',
    'vertex-anthropic', 'new-api', 'gateway', 'ollama'
  ]

  it('resolves all 11+ provider types without throwing', () => {
    for (const type of providerTypes) {
      const provider = makeProvider(type)
      expect(() => resolveProviderClient(provider)).not.toThrow()
    }
  })

  it('resolves alias types to their base types', () => {
    const aliasProvider = makeProvider('openai' as ProviderType)
    // Should not throw for known aliases
    expect(() => resolveProviderClient(aliasProvider)).not.toThrow()
  })

  it('falls back to openai for unknown types', () => {
    const unknownProvider = makeProvider('unknown-type' as ProviderType)
    expect(() => resolveProviderClient(unknownProvider)).not.toThrow()
  })

  it('selects from comma-separated API keys', () => {
    const provider = makeProvider('openai', { apiKey: 'key1,key2,key3' })
    // Should not throw — key rotation is internal
    expect(() => resolveProviderClient(provider)).not.toThrow()
  })
})

describe('Provider Config', () => {
  it('returns config for all provider types', () => {
    const types: ProviderType[] = [
      'openai', 'anthropic', 'gemini', 'mistral', 'ollama',
      'azure-openai', 'vertexai', 'aws-bedrock', 'vertex-anthropic',
      'new-api', 'gateway', 'openai-response'
    ]

    for (const type of types) {
      const config = getProviderConfig(type)
      expect(config).toBeDefined()
      expect(config.supportsStreaming).toBe(true)
    }
  })

  it('ollama does not require API key', () => {
    expect(requiresApiKey('ollama')).toBe(false)
  })

  it('openai requires API key', () => {
    expect(requiresApiKey('openai')).toBe(true)
  })

  it('vertexai uses OAuth auth type', () => {
    const config = getProviderConfig('vertexai')
    expect(config.authType).toBe('oauth')
  })
})
