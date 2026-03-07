import { configManager } from '@main/services/ConfigManager'
import { loggerService } from '@main/services/LoggerService'
import type { ProxyConfig } from '@shared/types'
import { session } from 'electron'

const logger = loggerService.withContext('ProxyManager')

class ProxyManager {
  async setProxy(config: ProxyConfig): Promise<void> {
    try {
      if (config.mode === 'direct') {
        await session.defaultSession.setProxy({ mode: 'direct' })
        logger.info('Proxy set to direct mode')
      } else if (config.mode === 'system') {
        await session.defaultSession.setProxy({ mode: 'system' })
        logger.info('Proxy set to system mode')
      } else if (config.mode === 'manual') {
        const proxyRules = this.buildProxyRules(config)
        const proxyBypassRules = config.bypass ? config.bypass.join(',') : ''

        await session.defaultSession.setProxy({
          proxyRules,
          proxyBypassRules
        })
        logger.info(`Proxy set to manual mode: ${proxyRules}`)
      }

      configManager.set('proxyConfig', config)
    } catch (error) {
      logger.error('Failed to set proxy', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  getProxy(): ProxyConfig {
    return configManager.get<ProxyConfig>('proxyConfig', { mode: 'direct' }) as ProxyConfig
  }

  private buildProxyRules(config: ProxyConfig): string {
    const protocol = config.protocol || 'http'
    const host = config.host || 'localhost'
    const port = config.port || 8080

    if (config.username && config.password) {
      return `${protocol}://${config.username}:${config.password}@${host}:${port}`
    }

    return `${protocol}://${host}:${port}`
  }
}

export const proxyManager = new ProxyManager()
export default proxyManager
