import { app, protocol } from 'electron'
import { getAppDataPath, getFilesPath, getLogsPath, getConfigPath, getNotesPath, isPortableMode } from '../utils/paths'

export interface AppInfo {
  name: string
  version: string
  electronVersion: string
  arch: string
  isPortable: boolean
  paths: {
    appData: string
    files: string
    logs: string
    config: string
    notes: string
  }
}

/**
 * Manages app lifecycle: path resolution, protocol registration, app info.
 */
export class AppService {
  /**
   * Registers the `cherrystudio://` custom protocol.
   * Must be called before app.whenReady().
   */
  registerProtocol(): void {
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'cherrystudio',
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true
        }
      }
    ])
  }

  private language = 'en-us'

  /** Sets the app language preference */
  setLanguage(language: string): void {
    this.language = language
  }

  /** Gets the current app language preference */
  getLanguage(): string {
    return this.language
  }

  /** Returns comprehensive app info */
  getInfo(): AppInfo {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      arch: process.arch,
      isPortable: isPortableMode(),
      paths: {
        appData: getAppDataPath(),
        files: getFilesPath(),
        logs: getLogsPath(),
        config: getConfigPath(),
        notes: getNotesPath()
      }
    }
  }
}
