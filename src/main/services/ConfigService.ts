import ElectronStore from 'electron-store'

// electron-store v11 is ESM-only; handle CJS interop
const Store = (ElectronStore as unknown as { default?: typeof ElectronStore }).default ?? ElectronStore
import {
  type AppConfig,
  type ConfigKey,
  CONFIG_DEFAULTS,
  AppConfigSchema,
  CURRENT_SCHEMA_VERSION
} from '@shared/types/config'
import type { WindowState } from '@shared/types/window'
import { DEFAULT_WINDOW_STATE } from '@shared/types/window'
import { logger } from './LoggerService'

interface StoreSchema {
  config: AppConfig
  windowStates: Record<string, WindowState>
}

class ConfigService {
  private static instance: ConfigService | null = null
  private store!: ElectronStore<StoreSchema>

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService()
    }
    return ConfigService.instance
  }

  initialize(): void {
    try {
      this.store = new Store<StoreSchema>({
        name: 'config',
        defaults: {
          config: CONFIG_DEFAULTS,
          windowStates: { main: DEFAULT_WINDOW_STATE }
        },
        clearInvalidConfig: true
      })

      this.migrateIfNeeded()
      logger.info('[ConfigService] Initialized')
    } catch (err) {
      logger.warn('[ConfigService] Config corrupted, resetting to defaults', err)
      this.store = new Store<StoreSchema>({
        name: 'config',
        defaults: {
          config: CONFIG_DEFAULTS,
          windowStates: { main: DEFAULT_WINDOW_STATE }
        },
        clearInvalidConfig: true
      })
      this.store.clear()
    }
  }

  private migrateIfNeeded(): void {
    const currentVersion = this.get('schemaVersion')
    if (currentVersion < CURRENT_SCHEMA_VERSION) {
      try {
        this.runMigrations(currentVersion, CURRENT_SCHEMA_VERSION)
        this.set('schemaVersion', CURRENT_SCHEMA_VERSION)
        logger.info(`[ConfigService] Migrated schema ${currentVersion} → ${CURRENT_SCHEMA_VERSION}`)
      } catch (err) {
        logger.warn('[ConfigService] Migration failed, resetting', err)
        this.store.clear()
      }
    }
  }

  private runMigrations(_from: number, _to: number): void {
    // Future migrations go here
  }

  get<K extends ConfigKey>(key: K): AppConfig[K] {
    const config = this.store.get('config') ?? CONFIG_DEFAULTS
    return config[key] ?? CONFIG_DEFAULTS[key]
  }

  set<K extends ConfigKey>(key: K, value: AppConfig[K]): void {
    const schema = AppConfigSchema.shape[key]
    const result = schema.safeParse(value)

    if (!result.success) {
      throw new Error(`Validation failed for config key "${key}": ${result.error.message}`)
    }

    const config = this.store.get('config') ?? { ...CONFIG_DEFAULTS }
    ;(config as Record<string, unknown>)[key] = value
    this.store.set('config', config)
  }

  reset(): void {
    this.store.set('config', CONFIG_DEFAULTS)
    logger.info('[ConfigService] Config reset to defaults')
  }

  getAll(): AppConfig {
    return this.store.get('config') ?? CONFIG_DEFAULTS
  }

  getWindowState(id = 'main'): WindowState {
    const states = this.store.get('windowStates') ?? {}
    return states[id] ?? { ...DEFAULT_WINDOW_STATE, id }
  }

  setWindowState(state: WindowState): void {
    const states = this.store.get('windowStates') ?? {}
    states[state.id] = state
    this.store.set('windowStates', states)
  }

  close(): void {
    // electron-store doesn't need explicit close
  }
}

export const configService = ConfigService.getInstance()
