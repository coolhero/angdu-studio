import { powerMonitor } from 'electron'
import { updateService } from './UpdateService'
import { logger } from './LoggerService'

class PowerService {
  private static instance: PowerService | null = null

  static getInstance(): PowerService {
    if (!PowerService.instance) {
      PowerService.instance = new PowerService()
    }
    return PowerService.instance
  }

  initialize(): void {
    powerMonitor.on('suspend', () => {
      logger.info('[PowerService] System suspending — pausing background tasks')
      updateService.pauseChecks()
    })

    powerMonitor.on('resume', () => {
      logger.info('[PowerService] System resumed — resuming background tasks')
      updateService.resumeChecks()
    })

    logger.info('[PowerService] Initialized')
  }
}

export const powerService = PowerService.getInstance()
