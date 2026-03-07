import { isPortable, isAppImage, isWayland } from '../bootstrap'

class PlatformService {
  get isMacOS(): boolean {
    return process.platform === 'darwin'
  }

  get isWindows(): boolean {
    return process.platform === 'win32'
  }

  get isLinux(): boolean {
    return process.platform === 'linux'
  }

  get isPortable(): boolean {
    return isPortable
  }

  get isAppImage(): boolean {
    return isAppImage
  }

  get isWayland(): boolean {
    return isWayland
  }

  get platform(): string {
    return process.platform
  }

  get arch(): string {
    return process.arch
  }

  get shouldDisableAnimations(): boolean {
    return this.isWindows
  }

  get shouldUseNativeTitleBar(): boolean {
    return this.isMacOS
  }
}

export const platformService = new PlatformService()
