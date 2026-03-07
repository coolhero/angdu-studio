import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock window.api
const mockSetTheme = vi.fn()
vi.stubGlobal('window', {
  api: {
    theme: {
      set: mockSetTheme,
      get: vi.fn(() => Promise.resolve({ mode: 'system', resolved: 'light' })),
      onChanged: vi.fn(() => vi.fn())
    }
  }
})

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.resetModules()
    mockSetTheme.mockClear()
  })

  it('should initialize with default values', async () => {
    const { useThemeStore } = await import('../../../src/renderer/src/stores/useThemeStore')
    const state = useThemeStore.getState()
    expect(state.mode).toBe('system')
    expect(state.resolved).toBe('light')
  })

  it('should set theme mode and call IPC', async () => {
    const { useThemeStore } = await import('../../../src/renderer/src/stores/useThemeStore')
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().mode).toBe('dark')
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should update resolved theme', async () => {
    const { useThemeStore } = await import('../../../src/renderer/src/stores/useThemeStore')
    useThemeStore.getState().setResolved('dark')
    expect(useThemeStore.getState().resolved).toBe('dark')
  })
})
