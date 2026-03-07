import { describe, it, expect, beforeAll } from 'vitest'
import i18next from 'i18next'
import enUs from '@renderer/i18n/locales/en-us.json'
import zhCn from '@renderer/i18n/locales/zh-cn.json'
import zhTw from '@renderer/i18n/locales/zh-tw.json'
import ja from '@renderer/i18n/locales/ja.json'

describe('i18n', () => {
  const i18n = i18next.createInstance()

  beforeAll(async () => {
    await i18n.init({
      resources: {
        'en-us': { translation: enUs },
        'zh-cn': { translation: zhCn },
        'zh-tw': { translation: zhTw },
        ja: { translation: ja }
      },
      fallbackLng: 'en-us',
      lowerCaseLng: true,
      interpolation: {
        escapeValue: false
      },
      lng: 'en-us'
    })
  })

  describe('initialization', () => {
    it('initializes with en-us as default language', () => {
      expect(i18n.language).toBe('en-us')
    })

    it('has en-us as fallback language', () => {
      expect(i18n.options.fallbackLng).toEqual(['en-us'])
    })

    it('does not escape interpolation values', () => {
      expect(i18n.options.interpolation?.escapeValue).toBe(false)
    })

    it('loads English translations correctly', () => {
      expect(i18n.t('app.name')).toBe('Cherry Studio')
      expect(i18n.t('common.ok')).toBe('OK')
      expect(i18n.t('settings.title')).toBe('Settings')
    })
  })

  describe('fallback', () => {
    it('falls back to en-us for missing keys in other languages', async () => {
      await i18n.changeLanguage('ja')
      // ja only has app.name, so other keys should fall back to en-us
      expect(i18n.t('app.name')).toBe('Cherry Studio')
      expect(i18n.t('common.ok')).toBe('OK')
    })

    it('falls back to en-us for unsupported languages', async () => {
      await i18n.changeLanguage('xx-xx')
      expect(i18n.t('app.name')).toBe('Cherry Studio')
    })
  })

  describe('language switching', () => {
    it('switches to zh-cn', async () => {
      await i18n.changeLanguage('zh-cn')
      expect(i18n.language).toBe('zh-cn')
      expect(i18n.t('common.ok')).toBe('确定')
      expect(i18n.t('settings.title')).toBe('设置')
    })

    it('switches to zh-tw', async () => {
      await i18n.changeLanguage('zh-tw')
      expect(i18n.language).toBe('zh-tw')
      expect(i18n.t('common.ok')).toBe('確定')
      expect(i18n.t('settings.title')).toBe('設定')
    })

    it('switches back to en-us', async () => {
      await i18n.changeLanguage('zh-cn')
      expect(i18n.t('common.ok')).toBe('确定')

      await i18n.changeLanguage('en-us')
      expect(i18n.t('common.ok')).toBe('OK')
    })
  })
})
