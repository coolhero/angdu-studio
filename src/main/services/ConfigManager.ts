import Store from 'electron-store'
import { DEFAULT_CONFIG } from '@shared/constants'

type Observer = (newValue: unknown, oldValue: unknown) => void

export class ConfigManager {
  private static instance: ConfigManager
  private store: Store
  private subscribers: Map<string, Set<Observer>> = new Map()

  private constructor() {
    this.store = new Store({
      name: 'config',
      defaults: DEFAULT_CONFIG as Record<string, unknown>
    })
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  get<T = unknown>(key: string, defaultValue?: T): T {
    return this.store.get(key, defaultValue) as T
  }

  set(key: string, value: unknown): void {
    const oldValue = this.store.get(key)
    this.store.set(key, value)
    this.notify(key, value, oldValue)
  }

  getAll(): Record<string, unknown> {
    return this.store.store as Record<string, unknown>
  }

  reset(key: string): void {
    const oldValue = this.store.get(key)
    const defaultValue = (DEFAULT_CONFIG as Record<string, unknown>)[key]
    if (defaultValue !== undefined) {
      this.store.set(key, defaultValue)
    } else {
      this.store.delete(key)
    }
    this.notify(key, defaultValue, oldValue)
  }

  resetAll(): void {
    this.store.clear()
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      this.store.set(key, value)
    }
  }

  subscribe(key: string, callback: Observer): void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)!.add(callback)
  }

  unsubscribe(key: string, callback: Observer): void {
    this.subscribers.get(key)?.delete(callback)
  }

  private notify(key: string, newValue: unknown, oldValue: unknown): void {
    const observers = this.subscribers.get(key)
    if (observers) {
      for (const callback of observers) {
        callback(newValue, oldValue)
      }
    }
  }
}
