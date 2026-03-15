import { ipcMain, nativeTheme } from 'electron'
import { configService } from '../services/ConfigService'
import { windowService } from '../services/WindowService'
import type { Theme } from '@shared/types/config'

function resolveTheme(preference: Theme): 'light' | 'dark' {
  if (preference === 'system') {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  }
  return preference
}

export function registerThemeHandlers(): void {
  ipcMain.handle('theme:get', () => {
    const preference = configService.get('theme')
    return resolveTheme(preference)
  })

  ipcMain.handle('theme:set', (_event, theme: Theme) => {
    configService.set('theme', theme)

    if (theme === 'system') {
      nativeTheme.themeSource = 'system'
    } else {
      nativeTheme.themeSource = theme
    }

    const resolved = resolveTheme(theme)
    windowService.getMainWindow()?.webContents.send('theme:changed', resolved)
  })

  nativeTheme.on('updated', () => {
    const preference = configService.get('theme')
    if (preference === 'system') {
      const resolved = resolveTheme('system')
      windowService.getMainWindow()?.webContents.send('theme:changed', resolved)
    }
  })
}
