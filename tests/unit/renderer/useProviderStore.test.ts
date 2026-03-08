import { describe, it, expect, beforeEach } from 'vitest'
import { useProviderStore } from '../../../src/renderer/src/stores/useProviderStore'
import type { Provider, Model } from '../../../src/renderer/src/types/provider'

const makeProvider = (overrides?: Partial<Provider>): Provider => ({
  id: 'test-provider',
  type: 'openai',
  name: 'Test Provider',
  apiKey: 'sk-test',
  apiHost: 'https://api.openai.com',
  models: [],
  enabled: true,
  ...overrides
})

const makeModel = (overrides?: Partial<Model>): Model => ({
  id: 'gpt-4o',
  provider: 'test-provider',
  name: 'GPT-4o',
  group: 'GPT-4',
  ...overrides
})

describe('useProviderStore', () => {
  beforeEach(() => {
    useProviderStore.setState({
      providers: [],
      defaultModel: undefined,
      quickModel: undefined,
      translateModel: undefined,
      settings: {}
    })
  })

  describe('Provider CRUD', () => {
    it('should add a provider', () => {
      const provider = makeProvider()
      useProviderStore.getState().addProvider(provider)
      expect(useProviderStore.getState().providers).toHaveLength(1)
      expect(useProviderStore.getState().providers[0].id).toBe('test-provider')
    })

    it('should update a provider', () => {
      useProviderStore.getState().addProvider(makeProvider())
      useProviderStore.getState().updateProvider('test-provider', { apiKey: 'sk-updated' })
      expect(useProviderStore.getState().providers[0].apiKey).toBe('sk-updated')
    })

    it('should remove a non-system provider', () => {
      useProviderStore.getState().addProvider(makeProvider())
      useProviderStore.getState().removeProvider('test-provider')
      expect(useProviderStore.getState().providers).toHaveLength(0)
    })

    it('should not remove a system provider', () => {
      useProviderStore.getState().addProvider(makeProvider({ isSystem: true }))
      useProviderStore.getState().removeProvider('test-provider')
      expect(useProviderStore.getState().providers).toHaveLength(1)
    })

    it('should reorder providers', () => {
      useProviderStore.getState().addProvider(makeProvider({ id: 'a', name: 'A' }))
      useProviderStore.getState().addProvider(makeProvider({ id: 'b', name: 'B' }))
      useProviderStore.getState().addProvider(makeProvider({ id: 'c', name: 'C' }))
      useProviderStore.getState().reorderProviders(['c', 'a', 'b'])
      const ids = useProviderStore.getState().providers.map((p) => p.id)
      expect(ids).toEqual(['c', 'a', 'b'])
    })

    it('should set enabled state', () => {
      useProviderStore.getState().addProvider(makeProvider())
      useProviderStore.getState().setEnabled('test-provider', false)
      expect(useProviderStore.getState().providers[0].enabled).toBe(false)
    })
  })

  describe('Model Management', () => {
    beforeEach(() => {
      useProviderStore.getState().addProvider(makeProvider())
    })

    it('should add a model to a provider', () => {
      const model = makeModel()
      useProviderStore.getState().addModel('test-provider', model)
      expect(useProviderStore.getState().providers[0].models).toHaveLength(1)
    })

    it('should remove a model from a provider', () => {
      useProviderStore.getState().addModel('test-provider', makeModel())
      useProviderStore.getState().removeModel('test-provider', 'gpt-4o')
      expect(useProviderStore.getState().providers[0].models).toHaveLength(0)
    })

    it('should update a model', () => {
      useProviderStore.getState().addModel('test-provider', makeModel())
      useProviderStore.getState().updateModel('test-provider', 'gpt-4o', { name: 'GPT-4o Updated' })
      expect(useProviderStore.getState().providers[0].models[0].name).toBe('GPT-4o Updated')
    })
  })

  describe('Model Selection', () => {
    it('should set default model', () => {
      const model = makeModel()
      useProviderStore.getState().setDefaultModel(model)
      expect(useProviderStore.getState().defaultModel?.id).toBe('gpt-4o')
    })

    it('should set quick model', () => {
      const model = makeModel({ id: 'gpt-4o-mini' })
      useProviderStore.getState().setQuickModel(model)
      expect(useProviderStore.getState().quickModel?.id).toBe('gpt-4o-mini')
    })

    it('should set translate model', () => {
      const model = makeModel({ id: 'gpt-4o-mini' })
      useProviderStore.getState().setTranslateModel(model)
      expect(useProviderStore.getState().translateModel?.id).toBe('gpt-4o-mini')
    })

    it('should clear model selection', () => {
      useProviderStore.getState().setDefaultModel(makeModel())
      useProviderStore.getState().setDefaultModel(undefined)
      expect(useProviderStore.getState().defaultModel).toBeUndefined()
    })
  })

  describe('Settings', () => {
    it('should update settings', () => {
      useProviderStore.getState().updateSettings({
        vertexai: { projectId: 'my-project', location: 'us-central1' }
      })
      expect(useProviderStore.getState().settings.vertexai?.projectId).toBe('my-project')
    })

    it('should merge settings', () => {
      useProviderStore.getState().updateSettings({
        vertexai: { projectId: 'my-project', location: 'us-central1' }
      })
      useProviderStore.getState().updateSettings({
        ollama: { keepAlive: 300 }
      })
      expect(useProviderStore.getState().settings.vertexai?.projectId).toBe('my-project')
      expect(useProviderStore.getState().settings.ollama?.keepAlive).toBe(300)
    })
  })
})
