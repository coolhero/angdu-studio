import type { ThemeMode } from '@shared/types'
import Store from 'electron-store'
import { loggerService } from './LoggerService'

const logger = loggerService.withContext('ConfigManager')

class ConfigManager {
  private store: Store

  constructor() {
    this.store = new Store({
      name: 'config',
      defaults: {
        theme: 'system',
        windowState: null,
        updateChannel: 'stable',
        locale: null,
        dataPath: null
      }
    })
    logger.info('ConfigManager initialized')
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.store.get(key, defaultValue) as T | undefined
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  getTheme(): ThemeMode {
    return this.get<ThemeMode>('theme', 'system') as ThemeMode
  }

  setTheme(theme: ThemeMode): void {
    this.set('theme', theme)
  }

  getUpdateChannel(): string {
    return this.get<string>('updateChannel', 'stable') as string
  }

  setUpdateChannel(channel: string): void {
    this.set('updateChannel', channel)
  }
}

export const configManager = new ConfigManager()
export default configManager
