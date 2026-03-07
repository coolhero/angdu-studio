import { describe, it, expect } from 'vitest'
import { PROVIDER_TYPES, SYSTEM_PROVIDER_IDS, isSystemProvider } from '@shared/types'
import type { Provider } from '@shared/types'

// ── T016: Provider Type Definitions & Guards ──

describe('PROVIDER_TYPES', () => {
  it('has exactly 12 values', () => {
    expect(PROVIDER_TYPES).toHaveLength(12)
  })

  it('includes core API protocol types', () => {
    const types = [...PROVIDER_TYPES]
    expect(types).toContain('openai')
    expect(types).toContain('anthropic')
    expect(types).toContain('gemini')
    expect(types).toContain('azure-openai')
    expect(types).toContain('ollama')
    expect(types).toContain('vertexai')
    expect(types).toContain('mistral')
    expect(types).toContain('aws-bedrock')
  })
})

describe('SYSTEM_PROVIDER_IDS', () => {
  it('contains key providers', () => {
    const ids = [...SYSTEM_PROVIDER_IDS]
    expect(ids).toContain('openai')
    expect(ids).toContain('anthropic')
    expect(ids).toContain('gemini')
    expect(ids).toContain('deepseek')
    expect(ids).toContain('ollama')
    expect(ids).toContain('cherryin')
    expect(ids).toContain('groq')
    expect(ids).toContain('mistral')
  })

  it('has at least 58 entries', () => {
    expect(SYSTEM_PROVIDER_IDS.length).toBeGreaterThanOrEqual(58)
  })
})

describe('isSystemProvider', () => {
  it('returns true for provider with valid SystemProviderId AND isSystem: true', () => {
    const provider: Provider = {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      apiKey: '',
      apiHost: 'https://api.openai.com',
      models: [],
      isSystem: true
    }
    expect(isSystemProvider(provider)).toBe(true)
  })

  it('returns true for anthropic system provider', () => {
    const provider: Provider = {
      id: 'anthropic',
      name: 'Anthropic',
      type: 'anthropic',
      apiKey: '',
      apiHost: 'https://api.anthropic.com',
      models: [],
      isSystem: true
    }
    expect(isSystemProvider(provider)).toBe(true)
  })

  it('returns false when id is not in SystemProviderId', () => {
    const provider: Provider = {
      id: 'my-custom-provider',
      name: 'Custom',
      type: 'openai',
      apiKey: '',
      apiHost: 'https://custom.api.com',
      models: [],
      isSystem: true
    }
    expect(isSystemProvider(provider)).toBe(false)
  })

  it('returns false when isSystem is false even with valid id', () => {
    const provider: Provider = {
      id: 'openai',
      name: 'OpenAI Fork',
      type: 'openai',
      apiKey: '',
      apiHost: 'https://api.openai.com',
      models: [],
      isSystem: false
    }
    expect(isSystemProvider(provider)).toBe(false)
  })

  it('returns false when isSystem is undefined', () => {
    const provider: Provider = {
      id: 'gemini',
      name: 'Gemini',
      type: 'gemini',
      apiKey: '',
      apiHost: 'https://generativelanguage.googleapis.com',
      models: []
    }
    expect(isSystemProvider(provider)).toBe(false)
  })
})
