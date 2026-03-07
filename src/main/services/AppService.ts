import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export class AppService {
  private static instance: AppService
  private dataPath: string

  private constructor() {
    this.dataPath = this.resolveDataPath()
  }

  static getInstance(): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService()
    }
    return AppService.instance
  }

  getPlatform(): NodeJS.Platform {
    return process.platform
  }

  isMac(): boolean {
    return process.platform === 'darwin'
  }

  isWindows(): boolean {
    return process.platform === 'win32'
  }

  isLinux(): boolean {
    return process.platform === 'linux'
  }

  getDataPath(): string {
    return this.dataPath
  }

  setDataPath(newPath: string): { success: boolean; error?: string } {
    if (!newPath) {
      this.dataPath = app.getPath('userData')
      return { success: true }
    }
    try {
      fs.accessSync(newPath, fs.constants.W_OK)
      this.dataPath = newPath
      return { success: true }
    } catch {
      return { success: false, error: `Path is not writable: ${newPath}` }
    }
  }

  isPortable(): boolean {
    return !!(process.env.PORTABLE_EXECUTABLE_DIR || this.isAppImage())
  }

  isAppImage(): boolean {
    return !!process.env.APPIMAGE
  }

  async setLaunchOnBoot(enabled: boolean): Promise<void> {
    if (this.isLinux()) {
      await this.setLinuxAutostart(enabled)
    } else {
      app.setLoginItemSettings({ openAtLogin: enabled })
    }
  }

  getLaunchOnBoot(): boolean {
    if (this.isLinux()) {
      return this.getLinuxAutostartEnabled()
    }
    return app.getLoginItemSettings().openAtLogin
  }

  private resolveDataPath(): string {
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
      return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'data')
    }
    return app.getPath('userData')
  }

  private async setLinuxAutostart(enabled: boolean): Promise<void> {
    const autostartDir = path.join(
      process.env.HOME || '~',
      '.config',
      'autostart'
    )
    const desktopFile = path.join(autostartDir, 'AngduStudio.desktop')

    if (enabled) {
      fs.mkdirSync(autostartDir, { recursive: true })
      const execPath = process.env.APPIMAGE || process.execPath
      const content = [
        '[Desktop Entry]',
        'Type=Application',
        'Name=Angdu Studio',
        `Exec=${execPath}`,
        'X-GNOME-Autostart-enabled=true',
        ''
      ].join('\n')
      fs.writeFileSync(desktopFile, content)
    } else {
      try {
        fs.unlinkSync(desktopFile)
      } catch {
        // File may not exist
      }
    }
  }

  private getLinuxAutostartEnabled(): boolean {
    const desktopFile = path.join(
      process.env.HOME || '~',
      '.config',
      'autostart',
      'AngduStudio.desktop'
    )
    try {
      fs.accessSync(desktopFile)
      return true
    } catch {
      return false
    }
  }
}
