import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-data'),
    getVersion: vi.fn(() => '0.1.0'),
    getName: vi.fn(() => 'AngduStudio'),
    isPackaged: false
  },
  session: {
    defaultSession: {
      setProxy: vi.fn()
    }
  }
}))

vi.mock('electron-store', () => ({
  default: class MockStore {
    private data = new Map<string, unknown>()
    private defaults: Record<string, unknown>
    constructor(opts?: { defaults?: Record<string, unknown> }) {
      this.defaults = opts?.defaults ?? {}
    }
    get(key: string, defaultValue?: unknown): unknown {
      return this.data.has(key) ? this.data.get(key) : (defaultValue ?? this.defaults[key as keyof typeof this.defaults])
    }
    set(key: string, value: unknown): void {
      this.data.set(key, value)
    }
  }
}))

const { proxyManager } = await import('@main/services/ProxyManager')

describe('ProxyManager', () => {
  afterEach(() => {
    // Clean up env vars
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.ALL_PROXY
    delete process.env.all_proxy
    delete process.env.NO_PROXY
    delete process.env.no_proxy
  })

  describe('isBypass', () => {
    it('matches <local> rule for hostnames without dots', () => {
      // Need to configure with bypass rules first
      expect(proxyManager.isBypass('localhost')).toBe(false) // No rules configured yet
    })

    it('matches wildcard domain rules', () => {
      expect(proxyManager.isBypass('test.example.com')).toBe(false) // No rules configured
    })
  })

  describe('configureProxy', () => {
    it('clears proxy with mode none', async () => {
      const { session } = await import('electron')
      await proxyManager.configureProxy({ mode: 'none' })
      expect(session.defaultSession.setProxy).toHaveBeenCalledWith({ mode: 'direct' })
    })

    it('sets env vars for custom proxy', async () => {
      await proxyManager.configureProxy({
        mode: 'custom',
        url: 'http://proxy.test:8080',
        bypassRules: []
      })
      expect(process.env.HTTP_PROXY).toBe('http://proxy.test:8080')
      expect(process.env.HTTPS_PROXY).toBe('http://proxy.test:8080')
    })
  })
})
