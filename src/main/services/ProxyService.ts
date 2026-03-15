import { session } from 'electron'
import { configService } from './ConfigService'
import { logger } from './LoggerService'

class ProxyService {
  private static instance: ProxyService | null = null

  static getInstance(): ProxyService {
    if (!ProxyService.instance) {
      ProxyService.instance = new ProxyService()
    }
    return ProxyService.instance
  }

  async initialize(): Promise<void> {
    const proxyUrl = configService.get('proxyUrl')
    if (proxyUrl) {
      await this.setProxy(proxyUrl)
    }
    logger.info('[ProxyService] Initialized')
  }

  async setProxy(proxyUrl: string): Promise<void> {
    try {
      await session.defaultSession.setProxy({ proxyRules: proxyUrl })
      logger.info(`[ProxyService] Proxy set: ${proxyUrl}`)
    } catch (err) {
      logger.warn(`[ProxyService] Invalid proxy, falling back to direct`, err)
      await session.defaultSession.setProxy({ proxyRules: '' })
    }
  }

  async clearProxy(): Promise<void> {
    await session.defaultSession.setProxy({ proxyRules: '' })
    logger.info('[ProxyService] Proxy cleared')
  }
}

export const proxyService = ProxyService.getInstance()
