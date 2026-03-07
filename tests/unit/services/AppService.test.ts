import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: vi.fn(() => true),
    quit: vi.fn(),
    getPath: vi.fn(() => '/tmp/angdu-test'),
    getName: vi.fn(() => 'Angdu Studio'),
    getVersion: vi.fn(() => '0.1.0'),
    isPackaged: false,
    setLoginItemSettings: vi.fn(),
    getLoginItemSettings: vi.fn(() => ({ openAtLogin: false })),
    whenReady: vi.fn(() => Promise.resolve())
  }
}))

describe('AppService', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should create a singleton instance', async () => {
    const { AppService } = await import('../../../src/main/services/AppService')
    const a = AppService.getInstance()
    const b = AppService.getInstance()
    expect(a).toBe(b)
  })

  it('should detect platform correctly', async () => {
    const { AppService } = await import('../../../src/main/services/AppService')
    const service = AppService.getInstance()
    expect(['darwin', 'win32', 'linux']).toContain(service.getPlatform())
  })

  it('should return data path', async () => {
    const { AppService } = await import('../../../src/main/services/AppService')
    const service = AppService.getInstance()
    expect(typeof service.getDataPath()).toBe('string')
  })

  it('should detect portable mode from env', async () => {
    const { AppService } = await import('../../../src/main/services/AppService')
    const service = AppService.getInstance()
    expect(typeof service.isPortable()).toBe('boolean')
  })
})
