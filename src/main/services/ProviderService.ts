import { safeStorage } from 'electron'
import { randomUUID } from 'node:crypto'
import ElectronStore from 'electron-store'
import type { Provider, Model } from '@shared/types/provider'
import type { ConnectionTestResult } from '@shared/types/ai-core'
import { SYSTEM_PROVIDERS } from '@shared/providers/system-providers'

const Store = (ElectronStore as unknown as { default?: typeof ElectronStore }).default ?? ElectronStore

interface ProviderStoreSchema {
  providers: Provider[]
}

export class ProviderService {
  private static instance: ProviderService
  private providers: Provider[] = []
  private store!: ElectronStore<ProviderStoreSchema>

  static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      ProviderService.instance = new ProviderService()
    }
    return ProviderService.instance
  }

  async initialize(): Promise<void> {
    this.store = new Store<ProviderStoreSchema>({
      name: 'providers',
      defaults: { providers: [] }
    })
    this.providers = this.store.get('providers') ?? []
    this.ensureSystemProviders()
  }

  private ensureSystemProviders(): void {
    for (const def of SYSTEM_PROVIDERS) {
      if (!this.providers.find((p) => p.id === def.id)) {
        this.providers.push({
          id: def.id,
          type: def.type,
          name: def.name,
          apiKey: '',
          apiHost: def.defaultApiHost,
          models: [],
          enabled: false,
          isSystem: true,
          isAuthed: false,
          apiOptions: {},
          extra_headers: {},
          notes: '',
          authType: 'apiKey'
        })
      }
    }
    this.persistProviders()
  }

  getProviders(): Provider[] {
    // Return providers with masked API keys for renderer
    return this.providers.map((p) => ({
      ...p,
      apiKey: p.apiKey ? '***' : ''
    }))
  }

  getProviderWithKey(id: string): Provider | undefined {
    return this.providers.find((p) => p.id === id)
  }

  addProvider(data: Omit<Provider, 'id' | 'models' | 'isAuthed'>): Provider {
    const provider: Provider = {
      ...data,
      id: randomUUID(),
      models: [],
      isAuthed: false,
      apiKey: this.encryptKey(data.apiKey)
    }
    this.providers.push(provider)
    this.persistProviders()
    return { ...provider, apiKey: '***' }
  }

  updateProvider(id: string, updates: Partial<Provider>): Provider {
    const idx = this.providers.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Provider not found: ${id}`)

    if (updates.apiKey && updates.apiKey !== '***') {
      updates.apiKey = this.encryptKey(updates.apiKey)
    } else {
      delete updates.apiKey // Don't overwrite with masked value
    }

    this.providers[idx] = { ...this.providers[idx], ...updates }
    this.persistProviders()
    return { ...this.providers[idx], apiKey: '***' }
  }

  deleteProvider(id: string): void {
    const provider = this.providers.find((p) => p.id === id)
    if (!provider) throw new Error(`Provider not found: ${id}`)
    if (provider.isSystem) throw new Error('Cannot delete system provider')
    this.providers = this.providers.filter((p) => p.id !== id)
    this.persistProviders()
  }

  async testConnection(id: string): Promise<ConnectionTestResult> {
    const provider = this.getProviderWithKey(id)
    if (!provider) return { success: false, error: 'Provider not found' }

    const apiKey = this.decryptKey(provider.apiKey)
    const start = Date.now()

    try {
      // Use a lightweight models endpoint to test connectivity
      const { AICoreService } = await import('./AICoreService')
      const aiCore = AICoreService.getInstance()
      await aiCore.testProvider(provider, apiKey)

      const latency = Date.now() - start
      this.updateProvider(id, { isAuthed: true })
      return { success: true, latency }
    } catch (err) {
      const latency = Date.now() - start
      const message = err instanceof Error ? err.message : 'Connection failed'
      this.updateProvider(id, { isAuthed: false })
      return { success: false, error: message, latency }
    }
  }

  private encryptKey(key: string): string {
    if (!key) return ''
    const trimmed = key.trim()
    if (!trimmed) return ''
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(trimmed).toString('base64')
    }
    // Fallback: store as-is with warning logged
    console.warn('[ProviderService] safeStorage not available — API key stored without encryption')
    return trimmed
  }

  decryptKey(encrypted: string): string {
    if (!encrypted) return ''
    if (safeStorage.isEncryptionAvailable()) {
      try {
        return safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
      } catch {
        // If decryption fails, it might be a plaintext fallback key
        return encrypted
      }
    }
    return encrypted
  }

  private persistProviders(): void {
    this.store.set('providers', this.providers)
  }

  updateModels(providerId: string, models: Model[]): void {
    const idx = this.providers.findIndex((p) => p.id === providerId)
    if (idx === -1) return

    // Preserve user capability overrides
    const existing = this.providers[idx].models
    const merged = models.map((newModel) => {
      const old = existing.find((m) => m.id === newModel.id)
      if (old) {
        const caps = newModel.capabilities.map((cap) => {
          const oldCap = old.capabilities.find((c) => c.type === cap.type)
          return oldCap?.isUserSelected ? oldCap : cap
        })
        return { ...newModel, capabilities: caps, enabled: old.enabled }
      }
      return newModel // preserve enabled from AICoreService.listModels() (chat-capable → true, others → false)
    })

    this.providers[idx].models = merged
    this.persistProviders()
  }

  addCustomModel(providerId: string, model: Omit<Model, 'provider'>): Model {
    const idx = this.providers.findIndex((p) => p.id === providerId)
    if (idx === -1) throw new Error(`Provider not found: ${providerId}`)

    const fullModel: Model = { ...model, provider: providerId }
    this.providers[idx].models.push(fullModel)
    this.persistProviders()
    return fullModel
  }
}
