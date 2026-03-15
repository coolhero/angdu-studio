import { z } from 'zod'

export const ThemeSchema = z.enum(['light', 'dark', 'system'])
export type Theme = z.infer<typeof ThemeSchema>

export const AppConfigSchema = z.object({
  theme: ThemeSchema.default('light'),
  language: z.string().default(''),
  proxyUrl: z.string().url().nullable().default(null),
  autoUpdate: z.boolean().default(true),
  updateInterval: z.number().min(60000).default(3600000),
  globalShortcut: z.string().nullable().default(null),
  schemaVersion: z.number().int().positive().default(1)
})

export type AppConfig = z.infer<typeof AppConfigSchema>

export const CONFIG_DEFAULTS: AppConfig = AppConfigSchema.parse({})

export type ConfigKey = keyof AppConfig

export const CONFIG_KEYS: ConfigKey[] = [
  'theme',
  'language',
  'proxyUrl',
  'autoUpdate',
  'updateInterval',
  'globalShortcut',
  'schemaVersion'
]

export const CURRENT_SCHEMA_VERSION = 1
