import { z } from 'zod'

export const ConfigKeySchema = z.enum([
  'theme',
  'language',
  'launchOnBoot',
  'proxyMode',
  'proxyUrl',
  'shortcuts',
  'windowState',
  'dataPath',
  'logLevel',
  'logShowModules'
])

export type ConfigKey = z.infer<typeof ConfigKeySchema>

export const ProxyModeSchema = z.enum(['system', 'fixed', 'direct'])
export type ProxyMode = z.infer<typeof ProxyModeSchema>

export const ProxyConfigSchema = z.object({
  mode: ProxyModeSchema,
  url: z.string().default('')
})
export type ProxyConfig = z.infer<typeof ProxyConfigSchema>

export const LogLevelSchema = z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
export type LogLevel = z.infer<typeof LogLevelSchema>

export interface ConfigChangeEvent {
  key: string
  value: unknown
  oldValue: unknown
}
