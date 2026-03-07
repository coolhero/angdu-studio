import Store from 'electron-store'
import type { ConfigSchema } from '@shared/types/config'
import { DEFAULT_CONFIG } from '@shared/constants'

/**
 * Wraps electron-store with typed ConfigSchema access.
 * Provides get/set/getAll/reset with corruption recovery.
 */
export class ConfigService {
  private store: Store<ConfigSchema>

  constructor() {
    this.store = new Store<ConfigSchema>({
      name: 'config',
      defaults: DEFAULT_CONFIG,
      clearInvalidConfig: true
    })
  }

  /** Get a single config value by key */
  get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    return this.store.get(key)
  }

  /** Set a single config value by key */
  set<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void {
    this.store.set(key, value)
  }

  /** Returns the entire config object */
  getAll(): ConfigSchema {
    return this.store.store
  }

  /** Resets config to defaults and returns the default config */
  reset(): ConfigSchema {
    this.store.clear()
    return this.getAll()
  }
}
