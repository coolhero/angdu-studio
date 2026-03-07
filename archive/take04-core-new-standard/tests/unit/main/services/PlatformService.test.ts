import { describe, it, expect, vi } from 'vitest'

vi.mock('electron', () => ({
  app: { getPath: vi.fn(() => '/tmp') }
}))

describe('PlatformService', () => {
  it('should detect platform correctly', async () => {
    const { platformService } = await import('../../../../src/main/services/PlatformService')
    const platform = process.platform

    if (platform === 'darwin') {
      expect(platformService.isMacOS).toBe(true)
      expect(platformService.isWindows).toBe(false)
      expect(platformService.isLinux).toBe(false)
    } else if (platform === 'win32') {
      expect(platformService.isWindows).toBe(true)
    } else if (platform === 'linux') {
      expect(platformService.isLinux).toBe(true)
    }
  })

  it('should expose platform flags as booleans', async () => {
    const { platformService } = await import('../../../../src/main/services/PlatformService')
    expect(typeof platformService.isMacOS).toBe('boolean')
    expect(typeof platformService.isWindows).toBe('boolean')
    expect(typeof platformService.isLinux).toBe('boolean')
    expect(typeof platformService.isPortable).toBe('boolean')
    expect(typeof platformService.isAppImage).toBe('boolean')
    expect(typeof platformService.isWayland).toBe('boolean')
  })
})
