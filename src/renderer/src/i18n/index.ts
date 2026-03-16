import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  'zh-CN': { translation: zhCN }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'ko',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
