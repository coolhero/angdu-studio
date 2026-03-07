import type { ProxyConfig } from '@shared/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSetProxy = vi.fn().mockResolvedValue(undefined)

const mockSession = {
  defaultSession: {
    setProxy: mockSetProxy
  }
}

vi.mock('electron', () => ({
  session: mockSession
}))

const mockConfigManager = {
  get: vi.fn().mockReturnValue({ mode: 'direct' }),
  set: vi.fn()
}

vi.mock('../ConfigManager', () => ({
  configManager: mockConfigManager
}))

vi.mock('../LoggerService', () => ({
  loggerService: {
    withContext: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    })
  }
}))

describe('ProxyManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConfigManager.get.mockReturnValue({ mode: 'direct' })
    mockSetProxy.mockResolvedValue(undefined)
  })

  async function createProxyManager() {
    const mod = await import('../ProxyManager')
    return mod.proxyManager
  }

  describe('setProxy', () => {
    it('should call session.setProxy with direct mode', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = { mode: 'direct' }

      await manager.setProxy(config)

      expect(mockSetProxy).toHaveBeenCalledWith({ mode: 'direct' })
    })

    it('should call session.setProxy with system mode', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = { mode: 'system' }

      await manager.setProxy(config)

      expect(mockSetProxy).toHaveBeenCalledWith({ mode: 'system' })
    })

    it('should construct correct proxy rules for manual HTTP mode', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = {
        mode: 'manual',
        protocol: 'http',
        host: '127.0.0.1',
        port: 8080
      }

      await manager.setProxy(config)

      expect(mockSetProxy).toHaveBeenCalledWith({
        proxyRules: 'http://127.0.0.1:8080',
        proxyBypassRules: ''
      })
    })

    it('should construct correct proxy rules for manual HTTPS mode', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = {
        mode: 'manual',
        protocol: 'https',
        host: 'proxy.example.com',
        port: 443
      }

      await manager.setProxy(config)

      expect(mockSetProxy).toHaveBeenCalledWith({
        proxyRules: 'https://proxy.example.com:443',
        proxyBypassRules: ''
      })
    })

    it('should construct correct proxy rules for SOCKS5 protocol', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = {
        mode: 'manual',
        protocol: 'socks5',
        host: 'socks.example.com',
        port: 1080
      }

      await manager.setProxy(config)

      expect(mockSetProxy).toHaveBeenCalledWith({
        proxyRules: 'socks5://socks.example.com:1080',
        proxyBypassRules: ''
      })
    })

    it('should handle authentication credentials in manual mode', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = {
        mode: 'manual',
        protocol: 'http',
        host: '127.0.0.1',
        port: 8080,
        username: 'user',
        password: 'pass'
      }

      await manager.setProxy(config)

      expect(mockSetProxy).toHaveBeenCalledWith({
        proxyRules: 'http://user:pass@127.0.0.1:8080',
        proxyBypassRules: ''
      })
    })

    it('should handle bypass rules', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = {
        mode: 'manual',
        protocol: 'http',
        host: '127.0.0.1',
        port: 8080,
        bypass: ['localhost', '127.0.0.1', '*.local']
      }

      await manager.setProxy(config)

      expect(mockSetProxy).toHaveBeenCalledWith({
        proxyRules: 'http://127.0.0.1:8080',
        proxyBypassRules: 'localhost,127.0.0.1,*.local'
      })
    })

    it('should persist config via ConfigManager', async () => {
      const manager = await createProxyManager()
      const config: ProxyConfig = { mode: 'system' }

      await manager.setProxy(config)

      expect(mockConfigManager.set).toHaveBeenCalledWith('proxyConfig', config)
    })
  })

  describe('getProxy', () => {
    it('should return current ProxyConfig from ConfigManager', async () => {
      const expected: ProxyConfig = {
        mode: 'manual',
        protocol: 'http',
        host: '127.0.0.1',
        port: 8080
      }
      mockConfigManager.get.mockReturnValue(expected)

      const manager = await createProxyManager()
      const result = manager.getProxy()

      expect(result).toEqual(expected)
      expect(mockConfigManager.get).toHaveBeenCalledWith('proxyConfig', { mode: 'direct' })
    })

    it('should return default direct config when nothing is stored', async () => {
      mockConfigManager.get.mockReturnValue({ mode: 'direct' })

      const manager = await createProxyManager()
      const result = manager.getProxy()

      expect(result).toEqual({ mode: 'direct' })
    })
  })
})
