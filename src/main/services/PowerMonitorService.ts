import { powerMonitor } from 'electron'
import { LoggerService } from './LoggerService'

type PowerCallback = () => void

export class PowerMonitorService {
  private static instance: PowerMonitorService
  private suspendListeners: PowerCallback[] = []
  private resumeListeners: PowerCallback[] = []
  private logger = LoggerService.getInstance().withContext('PowerMonitor')

  private constructor() {
    powerMonitor.on('suspend', () => {
      this.logger.info('System suspending')
      for (const cb of this.suspendListeners) cb()
    })

    powerMonitor.on('resume', () => {
      this.logger.info('System resuming')
      for (const cb of this.resumeListeners) cb()
    })
  }

  static getInstance(): PowerMonitorService {
    if (!PowerMonitorService.instance) {
      PowerMonitorService.instance = new PowerMonitorService()
    }
    return PowerMonitorService.instance
  }

  onSuspend(callback: PowerCallback): void {
    this.suspendListeners.push(callback)
  }

  onResume(callback: PowerCallback): void {
    this.resumeListeners.push(callback)
  }
}
