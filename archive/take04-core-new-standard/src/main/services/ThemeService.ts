import { nativeTheme, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { configManager } from '../config'
import { ConfigKeys } from '@shared/types'

export class ThemeService {
  constructor() {
    nativeTheme.on('updated', () => {
      this.broadcastTheme()
    })
  }

  setTheme(mode: string): void {
    nativeTheme.themeSource = mode as 'light' | 'dark' | 'system'
    configManager.set(ConfigKeys.Theme, mode === 'system' ? 'auto' : mode)
    this.broadcastTheme()
  }

  getTheme(): string {
    return configManager.get<string>(ConfigKeys.Theme)
  }

  getResolvedTheme(): string {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  }

  private broadcastTheme(): void {
    const resolved = this.getResolvedTheme()
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(IpcChannel.ThemeUpdated, { theme: resolved })
    })
  }
}

export const themeService = new ThemeService()
