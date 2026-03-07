import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-userdata'),
    setPath: vi.fn()
  }
}))

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn()
}))

describe('bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should export dataDir, filesDir, and logsDir', async () => {
    const bootstrap = await import('@main/bootstrap')
    expect(bootstrap.dataDir).toBeDefined()
    expect(bootstrap.filesDir).toBeDefined()
    expect(bootstrap.logsDir).toBeDefined()
  })

  it('should export platform detection flags', async () => {
    const bootstrap = await import('@main/bootstrap')
    expect(typeof bootstrap.isPortable).toBe('boolean')
    expect(typeof bootstrap.isAppImage).toBe('boolean')
    expect(typeof bootstrap.isWayland).toBe('boolean')
  })
})
