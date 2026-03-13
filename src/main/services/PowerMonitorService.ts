import { powerMonitor, BrowserWindow } from 'electron'

export class PowerMonitorService {
  private static instance: PowerMonitorService

  private constructor() {}

  static getInstance(): PowerMonitorService {
    if (!PowerMonitorService.instance) {
      PowerMonitorService.instance = new PowerMonitorService()
    }
    return PowerMonitorService.instance
  }

  /**
   * Initialize power monitor handlers.
   * Must be called after app is ready.
   */
  init(): void {
    // Register shutdown handler - works on all platforms (macOS, Windows, Linux)
    // On Windows, the 'shutdown' event is emitted when the system is about to shut down
    // On macOS/Linux, it's emitted on system shutdown/restart
    powerMonitor.on('shutdown', () => {
      this.handleShutdown()
    })

    // Handle suspend/resume for cleanup/restore
    powerMonitor.on('suspend', () => {
      this.handleSuspend()
    })

    powerMonitor.on('resume', () => {
      this.handleResume()
    })
  }

  /**
   * Handle system shutdown: notify all renderers to save data.
   */
  private handleShutdown(): void {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('app:save-data')
      }
    }
  }

  /**
   * Handle system suspend.
   */
  private handleSuspend(): void {
    // Save data before system sleeps
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('app:save-data')
      }
    }
  }

  /**
   * Handle system resume from suspend.
   */
  private handleResume(): void {
    // No-op for now; can be extended for reconnection logic
  }
}
