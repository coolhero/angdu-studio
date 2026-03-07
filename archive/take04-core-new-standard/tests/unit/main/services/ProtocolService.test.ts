import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApp = {
  setAsDefaultProtocolClient: vi.fn(() => true),
  isDefaultProtocolClient: vi.fn(() => false),
  getPath: vi.fn(() => '/tmp'),
  setPath: vi.fn()
}

vi.mock('electron', () => ({
  app: mockApp,
  BrowserWindow: { getAllWindows: vi.fn(() => []) }
}))

vi.mock('../../../../src/main/logger', () => ({
  withContext: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }))
}))

describe('ProtocolService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register cherry-studio protocol', async () => {
    const { ProtocolService } = await import('../../../../src/main/services/ProtocolService')
    const service = new ProtocolService()
    service.registerProtocol()
    expect(mockApp.setAsDefaultProtocolClient).toHaveBeenCalledWith('cherry-studio')
  })

  it('should parse deep link URLs', async () => {
    const { ProtocolService } = await import('../../../../src/main/services/ProtocolService')
    const service = new ProtocolService()
    const result = service.parseDeepLink('cherry-studio://action/test?param=value')
    expect(result).toBeDefined()
    expect(result.protocol).toBe('cherry-studio:')
  })
})
