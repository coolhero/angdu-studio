import { loggerService } from '@main/services/LoggerService'
import { powerMonitor } from 'electron'

const logger = loggerService.withContext('PowerMonitorService')

type StateChangeCallback = () => void

export class PowerMonitorService {
  private initialized = false
  private callbacks: StateChangeCallback[] = []

  public init(): void {
    if (this.initialized) {
      logger.warn('PowerMonitorService already initialized')
      return
    }

    powerMonitor.on('suspend', () => {
      logger.info('System suspend detected')
      this.notifyCallbacks()
    })

    powerMonitor.on('shutdown', () => {
      logger.info('System shutdown detected')
      this.notifyCallbacks()
    })

    powerMonitor.on('lock-screen', () => {
      logger.info('Screen lock detected')
      this.notifyCallbacks()
    })

    this.initialized = true
    logger.info('PowerMonitorService initialized')
  }

  public onStateChange(callback: StateChangeCallback): void {
    this.callbacks.push(callback)
    logger.info('State change callback registered', { totalCallbacks: this.callbacks.length })
  }

  private notifyCallbacks(): void {
    for (const callback of this.callbacks) {
      try {
        callback()
      } catch (error) {
        logger.error('Error in state change callback', { error: String(error) })
      }
    }
  }
}

export const powerMonitorService = new PowerMonitorService()
