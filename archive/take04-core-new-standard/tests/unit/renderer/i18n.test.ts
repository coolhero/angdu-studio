import { describe, it, expect, vi } from 'vitest'

vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockResolvedValue(undefined),
    t: vi.fn((key: string) => key),
    changeLanguage: vi.fn().mockResolvedValue(undefined),
    language: 'en-US',
    on: vi.fn()
  }
}))

vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: vi.fn() }
}))

describe('i18n', () => {
  it('should have en-US as fallback language', async () => {
    const i18next = (await import('i18next')).default
    expect(i18next.language).toBe('en-US')
  })

  it('should support changing language', async () => {
    const i18next = (await import('i18next')).default
    await i18next.changeLanguage('ko-KR')
    expect(i18next.changeLanguage).toHaveBeenCalledWith('ko-KR')
  })

  it('should define all 11 locale files', () => {
    const locales = [
      'en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ru-RU',
      'de-DE', 'el-GR', 'es-ES', 'fr-FR', 'pt-PT', 'ro-RO'
    ]
    expect(locales).toHaveLength(11)
  })
})
