import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'

const resources = {
  'en-US': { translation: enUS },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW }
}

export async function initI18n(language?: string): Promise<void> {
  await i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: language || 'en-US',
      fallbackLng: 'en-US',
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage']
      }
    })
}

export function changeLanguage(locale: string): Promise<void> {
  return i18next.changeLanguage(locale).then(() => undefined)
}

export default i18next
