import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '../theme'

describe('ThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system', isDark: false })
  })

  it('should have default theme mode as system', () => {
    expect(useThemeStore.getState().mode).toBe('system')
  })

  it('should set theme mode', () => {
    useThemeStore.getState().setMode('dark')
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('should track dark mode state', () => {
    useThemeStore.getState().setIsDark(true)
    expect(useThemeStore.getState().isDark).toBe(true)
  })
})
