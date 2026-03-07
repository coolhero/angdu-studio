import { configManager } from '@main/services/ConfigManager'
import { loggerService } from '@main/services/LoggerService'
import { app } from 'electron'

const logger = loggerService.withContext('VersionService')

const FEED_URL_BASE = 'https://github.com/kangfenmao/cherry-studio/releases/download'

class VersionService {
  getVersion(): string {
    return app.getVersion()
  }

  getUpdateChannel(): string {
    return configManager.getUpdateChannel()
  }

  setUpdateChannel(channel: string): void {
    configManager.setUpdateChannel(channel)
    logger.info('Update channel changed', { channel })
  }

  getFeedUrl(channel: string): string {
    return `${FEED_URL_BASE}/${channel}`
  }
}

export const versionService = new VersionService()
