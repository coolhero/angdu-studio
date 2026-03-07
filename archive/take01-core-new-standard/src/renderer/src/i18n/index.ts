import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Lazy-load locale files
import enUs from './locales/en-us.json'
import zhCn from './locales/zh-cn.json'
import zhTw from './locales/zh-tw.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ru from './locales/ru.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import ptBr from './locales/pt-br.json'
import ar from './locales/ar.json'
import it from './locales/it.json'
import tr from './locales/tr.json'
import vi from './locales/vi.json'

export const SUPPORTED_LANGUAGES = [
  'en-us',
  'zh-cn',
  'zh-tw',
  'ja',
  'ko',
  'ru',
  'de',
  'fr',
  'es',
  'pt-br',
  'ar',
  'it',
  'tr',
  'vi'
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const resources = {
  'en-us': { translation: enUs },
  'zh-cn': { translation: zhCn },
  'zh-tw': { translation: zhTw },
  ja: { translation: ja },
  ko: { translation: ko },
  ru: { translation: ru },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  'pt-br': { translation: ptBr },
  ar: { translation: ar },
  it: { translation: it },
  tr: { translation: tr },
  vi: { translation: vi }
}

export const i18nInitPromise = i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en-us',
  lowerCaseLng: true,
  interpolation: {
    escapeValue: false
  },
  lng: 'en-us'
})

export default i18n
