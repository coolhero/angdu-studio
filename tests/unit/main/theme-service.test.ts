import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeMode } from '@shared/types'

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-data'),
    getVersion: vi.fn(() => '0.1.0'),
    getName: vi.fn(() => 'AngduStudio'),
    isPackaged: false
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => [])
  },
  nativeTheme: {
    themeSource: 'system',
    shouldUseDarkColors: false,
    on: vi.fn()
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

const { themeService } = await import('@main/services/ThemeService')
const electron = await import('electron')

describe('ThemeService', () => {
  it('resolves dark theme correctly', () => {
    themeService.setTheme(ThemeMode.Dark)
    expect(themeService.getResolvedTheme()).toBe('dark')
    expect(electron.nativeTheme.themeSource).toBe('dark')
  })

  it('resolves light theme correctly', () => {
    themeService.setTheme(ThemeMode.Light)
    expect(themeService.getResolvedTheme()).toBe('light')
    expect(electron.nativeTheme.themeSource).toBe('light')
  })

  it('resolves system theme based on nativeTheme', () => {
    themeService.setTheme(ThemeMode.System)
    expect(electron.nativeTheme.themeSource).toBe('system')
  })
})
