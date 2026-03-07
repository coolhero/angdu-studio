import { app } from 'electron'

export class VersionService {
  private static instance: VersionService

  private constructor() {}

  static getInstance(): VersionService {
    if (!VersionService.instance) {
      VersionService.instance = new VersionService()
    }
    return VersionService.instance
  }

  getAppInfo(): {
    name: string
    version: string
    platform: string
    arch: string
    isPortable: boolean
  } {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      isPortable: !!(process.env.PORTABLE_EXECUTABLE_DIR || process.env.APPIMAGE)
    }
  }

  getVersion(): string {
    return app.getVersion()
  }
}
