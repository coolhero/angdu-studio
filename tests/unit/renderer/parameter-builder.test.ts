import { describe, it, expect } from 'vitest'
import { buildStreamTextParams } from '../../../src/renderer/src/aiCore/prepareParams/parameterBuilder'
import type { Provider, Model } from '../../../src/renderer/src/types/provider'

const makeProvider = (overrides?: Partial<Provider>): Provider => ({
  id: 'test', type: 'openai', name: 'Test', apiKey: 'sk-test',
  apiHost: 'https://api.openai.com', models: [], enabled: true,
  ...overrides
})

const makeModel = (overrides?: Partial<Model>): Model => ({
  id: 'gpt-4o', provider: 'test', name: 'GPT-4o', group: 'GPT-4',
  capabilities: ['vision', 'function_calling'],
  ...overrides
})

describe('buildStreamTextParams', () => {
  it('builds basic params with model ID and messages', () => {
    const result = buildStreamTextParams({
      provider: makeProvider(),
      model: makeModel(),
      messages: [{ role: 'user', content: 'Hello' }]
    })

    expect(result.model).toBe('gpt-4o')
    expect(result.messages).toHaveLength(1)
  })

  it('applies optional parameters when provided', () => {
    const result = buildStreamTextParams({
      provider: makeProvider(),
      model: makeModel(),
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.7,
      topK: 50,
      frequencyPenalty: 0.5,
      maxTokens: 1000,
      seed: 42
    })

    expect(result.temperature).toBe(0.7)
    expect(result.topK).toBe(50)
    expect(result.frequencyPenalty).toBe(0.5)
    expect(result.maxTokens).toBe(1000)
    expect(result.seed).toBe(42)
  })

  it('omits optional parameters when not provided', () => {
    const result = buildStreamTextParams({
      provider: makeProvider(),
      model: makeModel(),
      messages: [{ role: 'user', content: 'Hello' }]
    })

    expect(result.temperature).toBeUndefined()
    expect(result.topK).toBeUndefined()
    expect(result.seed).toBeUndefined()
  })

  it('includes tools when model supports function_calling', () => {
    const tools = [{ name: 'search', description: 'Search', parameters: {} }]
    const result = buildStreamTextParams({
      provider: makeProvider(),
      model: makeModel({ capabilities: ['function_calling'] }),
      messages: [{ role: 'user', content: 'Hello' }],
      tools
    })

    expect(result.tools).toEqual(tools)
  })

  it('excludes tools when model lacks function_calling', () => {
    const tools = [{ name: 'search', description: 'Search', parameters: {} }]
    const result = buildStreamTextParams({
      provider: makeProvider(),
      model: makeModel({ capabilities: ['vision'] }),
      messages: [{ role: 'user', content: 'Hello' }],
      tools
    })

    expect(result.tools).toBeUndefined()
  })

  it('builds provider-specific headers', () => {
    const result = buildStreamTextParams({
      provider: makeProvider({
        type: 'anthropic',
        extra_headers: { 'X-Custom': 'value' }
      }),
      model: makeModel(),
      messages: [{ role: 'user', content: 'Hello' }]
    })

    expect(result.headers?.['X-Custom']).toBe('value')
    expect(result.headers?.['anthropic-beta']).toBeDefined()
  })

  it('applies reasoning provider options for reasoning models', () => {
    const result = buildStreamTextParams({
      provider: makeProvider({ type: 'openai' }),
      model: makeModel({ capabilities: ['reasoning'] }),
      messages: [{ role: 'user', content: 'Hello' }],
      reasoningEffort: 'high'
    })

    expect(result.providerOptions).toBeDefined()
  })
})
