import { app } from 'electron'
import { isPortable, isMac, isWindows } from './utils/platform'
import { getUserDataPath } from './utils/paths'

export function bootstrap(): void {
  // Set userData path for portable mode
  if (isPortable()) {
    app.setPath('userData', getUserDataPath())
  }

  // Platform-specific app metadata
  if (isWindows) {
    app.setAppUserModelId('com.kangfenmao.CherryStudio')
  }

  // macOS dock icon is visible by default — no setup needed here

  // Set app name
  app.setName('Cherry Studio')
}
