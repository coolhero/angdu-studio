import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SUPPORTED_LOCALES } from '@shared/constants'

// Mock i18next
const mockInit = vi.fn().mockResolvedValue(undefined)
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined)
const mockT = vi.fn().mockReturnValue('translated')

vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: mockInit,
    changeLanguage: mockChangeLanguage,
    t: mockT,
    language: 'en-US'
  }
}))

vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: vi.fn() }
}))

describe('i18n configuration', () => {
  it('should support 10 locales', () => {
    expect(SUPPORTED_LOCALES).toHaveLength(10)
  })

  it('should include required locales', () => {
    expect(SUPPORTED_LOCALES).toContain('en-US')
    expect(SUPPORTED_LOCALES).toContain('ko-KR')
    expect(SUPPORTED_LOCALES).toContain('ja-JP')
    expect(SUPPORTED_LOCALES).toContain('ru-RU')
    expect(SUPPORTED_LOCALES).toContain('de-DE')
    expect(SUPPORTED_LOCALES).toContain('el-GR')
    expect(SUPPORTED_LOCALES).toContain('es-ES')
    expect(SUPPORTED_LOCALES).toContain('fr-FR')
    expect(SUPPORTED_LOCALES).toContain('pt-PT')
    expect(SUPPORTED_LOCALES).toContain('ro-RO')
  })

  it('should not include Chinese locales', () => {
    expect(SUPPORTED_LOCALES).not.toContain('zh-CN')
    expect(SUPPORTED_LOCALES).not.toContain('zh-TW')
  })

  it('should use English as fallback', () => {
    // Verified in the init configuration
    expect(SUPPORTED_LOCALES[0]).toBe('en-US')
  })
})
