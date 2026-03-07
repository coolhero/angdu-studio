import Store from 'electron-store'
import { ConfigKey, type ConfigValues } from '@shared/types'
import { CONFIG_DEFAULTS } from '@shared/constants'

type Subscriber<K extends ConfigKey> = (value: ConfigValues[K]) => void

export class ConfigManager {
  private store: Store
  private subscribers = new Map<ConfigKey, Set<Subscriber<ConfigKey>>>()

  constructor() {
    this.store = new Store({
      defaults: CONFIG_DEFAULTS,
      clearInvalidConfig: true
    })
  }

  get<K extends ConfigKey>(key: K): ConfigValues[K] {
    return this.store.get(key) as ConfigValues[K]
  }

  set<K extends ConfigKey>(key: K, value: ConfigValues[K]): void {
    this.store.set(key, value)
  }

  setAndNotify<K extends ConfigKey>(key: K, value: ConfigValues[K]): void {
    this.store.set(key, value)
    this.notify(key, value)
  }

  subscribe<K extends ConfigKey>(
    key: K,
    callback: Subscriber<K>
  ): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    const subs = this.subscribers.get(key)!
    subs.add(callback as Subscriber<ConfigKey>)

    return () => {
      subs.delete(callback as Subscriber<ConfigKey>)
    }
  }

  private notify<K extends ConfigKey>(key: K, value: ConfigValues[K]): void {
    const subs = this.subscribers.get(key)
    if (subs) {
      for (const cb of subs) {
        cb(value as ConfigValues[ConfigKey])
      }
    }
  }

  getAll(): Record<string, unknown> {
    return this.store.store as Record<string, unknown>
  }
}
