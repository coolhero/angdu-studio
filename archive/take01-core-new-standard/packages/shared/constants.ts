import type { ConfigSchema } from './types/config'

export const APP_NAME = 'Cherry Studio'

export const DEFAULT_CONFIG: ConfigSchema = {
  theme: 'system',
  language: 'en',
  fontSize: 14,
  sendWithEnter: true,
  proxyUrl: '',
  autoUpdate: true
}
