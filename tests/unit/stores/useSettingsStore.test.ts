import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '../../../src/renderer/src/stores/useSettingsStore'

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings()
  })

  describe('default values', () => {
    it('has correct default sendMessageShortcut', () => {
      expect(useSettingsStore.getState().sendMessageShortcut).toBe('Enter')
    })

    it('has correct default fontSize', () => {
      expect(useSettingsStore.getState().fontSize).toBe(14)
    })

    it('has correct default messageStyle', () => {
      expect(useSettingsStore.getState().messageStyle).toBe('plain')
    })

    it('has correct default narrowMode', () => {
      expect(useSettingsStore.getState().narrowMode).toBe(false)
    })

    it('has correct default showAssistants and showTopics', () => {
      expect(useSettingsStore.getState().showAssistants).toBe(true)
      expect(useSettingsStore.getState().showTopics).toBe(true)
    })

    it('has correct default mathEngine', () => {
      expect(useSettingsStore.getState().mathEngine).toBe('katex')
    })

    it('has correct default codeStyle and codeFontFamily', () => {
      expect(useSettingsStore.getState().codeStyle).toBe('auto')
      expect(useSettingsStore.getState().codeFontFamily).toBe('monospace')
    })
  })

  describe('setSetting', () => {
    it('updates sendMessageShortcut', () => {
      useSettingsStore.getState().setSetting('sendMessageShortcut', 'Ctrl+Enter')
      expect(useSettingsStore.getState().sendMessageShortcut).toBe('Ctrl+Enter')
    })

    it('updates fontSize', () => {
      useSettingsStore.getState().setSetting('fontSize', 18)
      expect(useSettingsStore.getState().fontSize).toBe(18)
    })

    it('updates messageStyle', () => {
      useSettingsStore.getState().setSetting('messageStyle', 'bubble')
      expect(useSettingsStore.getState().messageStyle).toBe('bubble')
    })

    it('updates narrowMode', () => {
      useSettingsStore.getState().setSetting('narrowMode', true)
      expect(useSettingsStore.getState().narrowMode).toBe(true)
    })

    it('updates topicPosition', () => {
      useSettingsStore.getState().setSetting('topicPosition', 'right')
      expect(useSettingsStore.getState().topicPosition).toBe('right')
    })

    it('updates multiple settings independently', () => {
      useSettingsStore.getState().setSetting('fontSize', 20)
      useSettingsStore.getState().setSetting('narrowMode', true)

      expect(useSettingsStore.getState().fontSize).toBe(20)
      expect(useSettingsStore.getState().narrowMode).toBe(true)
      // other defaults remain
      expect(useSettingsStore.getState().messageStyle).toBe('plain')
    })
  })

  describe('resetSettings', () => {
    it('restores all settings to defaults after changes', () => {
      useSettingsStore.getState().setSetting('fontSize', 24)
      useSettingsStore.getState().setSetting('narrowMode', true)
      useSettingsStore.getState().setSetting('messageStyle', 'bubble')
      useSettingsStore.getState().setSetting('codeStyle', 'dark')

      useSettingsStore.getState().resetSettings()

      expect(useSettingsStore.getState().fontSize).toBe(14)
      expect(useSettingsStore.getState().narrowMode).toBe(false)
      expect(useSettingsStore.getState().messageStyle).toBe('plain')
      expect(useSettingsStore.getState().codeStyle).toBe('auto')
    })
  })
})
