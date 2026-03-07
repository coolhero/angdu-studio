import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock BroadcastChannel (not available in Node test environment)
vi.stubGlobal(
  'BroadcastChannel',
  class {
    onmessage = null
    postMessage() {}
    close() {}
  }
)

// Mock localStorage for Zustand persist middleware
const storage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value
  },
  removeItem: (key: string) => {
    delete storage[key]
  }
})

import { useLlmStore } from '../../../src/renderer/src/stores/useLlmStore'
import type { Provider, Model } from '@shared/types'

// ── Helpers ──

function makeProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    id: 'test-provider',
    name: 'Test Provider',
    type: 'openai',
    apiKey: 'sk-test',
    apiHost: 'https://api.test.com',
    models: [],
    enabled: false,
    isSystem: false,
    ...overrides
  }
}

function makeModel(overrides: Partial<Model> = {}): Model {
  return {
    id: 'test-model',
    name: 'Test Model',
    provider: 'test-provider',
    ...overrides
  }
}

const DEFAULT_MODEL: Model = {
  id: 'qwen3-next-80b',
  name: 'Qwen 3 Next 80B',
  provider: 'cherryin',
  group: 'Qwen'
}

const TOPIC_NAMING_MODEL: Model = {
  id: 'qwen3-8b',
  name: 'Qwen 3 8B',
  provider: 'cherryin',
  group: 'Qwen'
}

// ── Reset store before each test ──

beforeEach(() => {
  useLlmStore.setState({
    providers: [],
    defaultModel: DEFAULT_MODEL,
    topicNamingModel: TOPIC_NAMING_MODEL,
    quickModel: DEFAULT_MODEL,
    translateModel: DEFAULT_MODEL,
    settings: {
      ollama: { keepAliveTime: 3600 },
      lmstudio: { keepAliveTime: 3600 },
      gpustack: { keepAliveTime: 3600 },
      vertexai: {
        serviceAccount: { privateKey: '', clientEmail: '' },
        projectId: '',
        location: 'us-central1'
      },
      awsBedrock: {
        authType: 'apiKey',
        accessKeyId: '',
        secretAccessKey: '',
        apiKey: '',
        region: 'us-east-1'
      },
      cherryIn: { accessToken: '', refreshToken: '' }
    }
  })
})

// ── T014: Provider CRUD ──

describe('Provider CRUD (T014)', () => {
  it('addProvider prepends to list', () => {
    const existing = makeProvider({ id: 'existing', name: 'Existing' })
    const newProvider = makeProvider({ id: 'new', name: 'New' })

    useLlmStore.setState({ providers: [existing] })
    useLlmStore.getState().addProvider(newProvider)

    const providers = useLlmStore.getState().providers
    expect(providers).toHaveLength(2)
    expect(providers[0].id).toBe('new')
    expect(providers[1].id).toBe('existing')
  })

  it('removeProvider removes by ID', () => {
    const p1 = makeProvider({ id: 'p1' })
    const p2 = makeProvider({ id: 'p2' })

    useLlmStore.setState({ providers: [p1, p2] })
    useLlmStore.getState().removeProvider('p1')

    const providers = useLlmStore.getState().providers
    expect(providers).toHaveLength(1)
    expect(providers[0].id).toBe('p2')
  })

  it('removeProvider rejects system provider deletion', () => {
    const systemProvider = makeProvider({ id: 'openai', name: 'OpenAI', isSystem: true })
    const customProvider = makeProvider({ id: 'custom', name: 'Custom', isSystem: false })

    useLlmStore.setState({ providers: [systemProvider, customProvider] })
    useLlmStore.getState().removeProvider('openai')

    const providers = useLlmStore.getState().providers
    expect(providers).toHaveLength(2)
    expect(providers.find((p) => p.id === 'openai')).toBeDefined()
  })

  it('updateProvider merges partial update', () => {
    const provider = makeProvider({ id: 'p1', name: 'Original', enabled: false })

    useLlmStore.setState({ providers: [provider] })
    useLlmStore.getState().updateProvider('p1', { name: 'Updated', enabled: true })

    const updated = useLlmStore.getState().providers[0]
    expect(updated.name).toBe('Updated')
    expect(updated.enabled).toBe(true)
    expect(updated.id).toBe('p1')
    expect(updated.apiKey).toBe('sk-test')
  })

  it('updateAll replaces entire provider list', () => {
    const old1 = makeProvider({ id: 'old1' })
    const old2 = makeProvider({ id: 'old2' })
    const new1 = makeProvider({ id: 'new1' })

    useLlmStore.setState({ providers: [old1, old2] })
    useLlmStore.getState().updateAll([new1])

    const providers = useLlmStore.getState().providers
    expect(providers).toHaveLength(1)
    expect(providers[0].id).toBe('new1')
  })
})

// ── T015: Model CRUD ──

describe('Model CRUD (T015)', () => {
  it('addModel adds model to provider', () => {
    const provider = makeProvider({ id: 'p1', models: [] })
    const model = makeModel({ id: 'm1', provider: 'p1' })

    useLlmStore.setState({ providers: [provider] })
    useLlmStore.getState().addModel('p1', model)

    const models = useLlmStore.getState().providers[0].models
    expect(models).toHaveLength(1)
    expect(models[0].id).toBe('m1')
  })

  it('addModel deduplicates by ID', () => {
    const model = makeModel({ id: 'm1', name: 'First' })
    const provider = makeProvider({ id: 'p1', models: [model] })
    const duplicate = makeModel({ id: 'm1', name: 'Duplicate' })

    useLlmStore.setState({ providers: [provider] })
    useLlmStore.getState().addModel('p1', duplicate)

    const models = useLlmStore.getState().providers[0].models
    expect(models).toHaveLength(1)
    expect(models[0].name).toBe('First')
  })

  it('addModel auto-enables provider', () => {
    const provider = makeProvider({ id: 'p1', enabled: false, models: [] })
    const model = makeModel({ id: 'm1' })

    useLlmStore.setState({ providers: [provider] })
    useLlmStore.getState().addModel('p1', model)

    expect(useLlmStore.getState().providers[0].enabled).toBe(true)
  })

  it('removeModel removes model from provider', () => {
    const m1 = makeModel({ id: 'm1' })
    const m2 = makeModel({ id: 'm2' })
    const provider = makeProvider({ id: 'p1', models: [m1, m2] })

    useLlmStore.setState({ providers: [provider] })
    useLlmStore.getState().removeModel('p1', 'm1')

    const models = useLlmStore.getState().providers[0].models
    expect(models).toHaveLength(1)
    expect(models[0].id).toBe('m2')
  })

  it('updateModel merges partial update', () => {
    const model = makeModel({ id: 'm1', name: 'Original' })
    const provider = makeProvider({ id: 'p1', models: [model] })

    useLlmStore.setState({ providers: [provider] })
    useLlmStore.getState().updateModel('p1', 'm1', { name: 'Updated' })

    const updated = useLlmStore.getState().providers[0].models[0]
    expect(updated.name).toBe('Updated')
    expect(updated.id).toBe('m1')
    expect(updated.provider).toBe('test-provider')
  })
})

// ── Move Provider ──

describe('Move Provider', () => {
  it('moveProvider moves to position 1 (front)', () => {
    const p1 = makeProvider({ id: 'p1' })
    const p2 = makeProvider({ id: 'p2' })
    const p3 = makeProvider({ id: 'p3' })

    useLlmStore.setState({ providers: [p1, p2, p3] })
    useLlmStore.getState().moveProvider('p3', 1)

    const ids = useLlmStore.getState().providers.map((p) => p.id)
    expect(ids).toEqual(['p3', 'p1', 'p2'])
  })

  it('moveProvider moves to last position', () => {
    const p1 = makeProvider({ id: 'p1' })
    const p2 = makeProvider({ id: 'p2' })
    const p3 = makeProvider({ id: 'p3' })

    useLlmStore.setState({ providers: [p1, p2, p3] })
    useLlmStore.getState().moveProvider('p1', 3)

    const ids = useLlmStore.getState().providers.map((p) => p.id)
    expect(ids).toEqual(['p2', 'p3', 'p1'])
  })
})

// ── Default Models ──

describe('Default Models', () => {
  it('setDefaultModel updates defaultModel', () => {
    const newModel = makeModel({ id: 'gpt-4', name: 'GPT-4', provider: 'openai' })

    useLlmStore.getState().setDefaultModel(newModel)

    expect(useLlmStore.getState().defaultModel).toEqual(newModel)
  })

  it('setTopicNamingModel updates topicNamingModel', () => {
    const newModel = makeModel({ id: 'gpt-3.5', name: 'GPT-3.5', provider: 'openai' })

    useLlmStore.getState().setTopicNamingModel(newModel)

    expect(useLlmStore.getState().topicNamingModel).toEqual(newModel)
  })
})

// ── T040: Provider Settings Persistence ──

describe('Provider Settings (T040)', () => {
  it('updateProvider persists custom headers', () => {
    const provider = makeProvider({ id: 'p1' })
    useLlmStore.setState({ providers: [provider] })

    useLlmStore.getState().updateProvider('p1', {
      extra_headers: { 'X-Custom': 'value', 'X-Api-Version': '2024-01' }
    })

    const updated = useLlmStore.getState().providers[0]
    expect(updated.extra_headers).toEqual({ 'X-Custom': 'value', 'X-Api-Version': '2024-01' })
  })

  it('updateProvider persists rate limit', () => {
    const provider = makeProvider({ id: 'p1' })
    useLlmStore.setState({ providers: [provider] })

    useLlmStore.getState().updateProvider('p1', { rateLimit: 5 })

    expect(useLlmStore.getState().providers[0].rateLimit).toBe(5)
  })

  it('updateProvider persists API options', () => {
    const provider = makeProvider({ id: 'p1' })
    useLlmStore.setState({ providers: [provider] })

    useLlmStore.getState().updateProvider('p1', {
      apiOptions: {
        isNotSupportArrayContent: true,
        isSupportDeveloperRole: true
      }
    })

    const opts = useLlmStore.getState().providers[0].apiOptions
    expect(opts?.isNotSupportArrayContent).toBe(true)
    expect(opts?.isSupportDeveloperRole).toBe(true)
  })

  it('updateProvider persists anthropicApiHost and serviceTier', () => {
    const provider = makeProvider({ id: 'p1', type: 'anthropic' })
    useLlmStore.setState({ providers: [provider] })

    useLlmStore.getState().updateProvider('p1', {
      anthropicApiHost: 'https://anthropic.example.com',
      serviceTier: 'flex'
    })

    const updated = useLlmStore.getState().providers[0]
    expect(updated.anthropicApiHost).toBe('https://anthropic.example.com')
    expect(updated.serviceTier).toBe('flex')
  })
})

// ── CherryIN Tokens ──

describe('CherryIN Tokens', () => {
  it('setCherryInTokens updates tokens', () => {
    useLlmStore.getState().setCherryInTokens('new-access-token', 'new-refresh-token')

    const { cherryIn } = useLlmStore.getState().settings
    expect(cherryIn.accessToken).toBe('new-access-token')
    expect(cherryIn.refreshToken).toBe('new-refresh-token')
  })

  it('setCherryInTokens preserves existing refreshToken when not provided', () => {
    useLlmStore.getState().setCherryInTokens('access-1', 'refresh-1')
    useLlmStore.getState().setCherryInTokens('access-2')

    const { cherryIn } = useLlmStore.getState().settings
    expect(cherryIn.accessToken).toBe('access-2')
    expect(cherryIn.refreshToken).toBe('refresh-1')
  })

  it('clearCherryInTokens resets to empty', () => {
    useLlmStore.getState().setCherryInTokens('some-token', 'some-refresh')
    useLlmStore.getState().clearCherryInTokens()

    const { cherryIn } = useLlmStore.getState().settings
    expect(cherryIn.accessToken).toBe('')
    expect(cherryIn.refreshToken).toBe('')
  })
})
