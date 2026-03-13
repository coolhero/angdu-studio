import { app } from 'electron'
import { isMac, isWin, isLinux } from '../constant'

export class AppService {
  private static instance: AppService

  private constructor() {}

  static getInstance(): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService()
    }
    return AppService.instance
  }

  /**
   * Set whether the app launches on system boot.
   * Uses platform-specific APIs.
   */
  setAppLaunchOnBoot(enabled: boolean): void {
    if (isMac) {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        openAsHidden: true,
      })
    } else if (isWin) {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        args: ['--hidden'],
      })
    } else if (isLinux) {
      app.setLoginItemSettings({
        openAtLogin: enabled,
      })
    }
  }

  /**
   * Relaunch the application.
   * Platform-specific handling for clean restart.
   */
  relaunch(): void {
    if (isMac) {
      // On macOS, relaunch and exit current instance
      app.relaunch()
      app.exit(0)
    } else {
      // On Windows/Linux, relaunch with same args
      app.relaunch({ args: process.argv.slice(1) })
      app.exit(0)
    }
  }
}
