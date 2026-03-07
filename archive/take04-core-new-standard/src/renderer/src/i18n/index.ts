import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import dayjs from 'dayjs'

import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import jaJP from './locales/ja-JP.json'
import ruRU from './locales/ru-RU.json'
import deDE from './locales/de-DE.json'
import elGR from './locales/el-GR.json'
import esES from './locales/es-ES.json'
import frFR from './locales/fr-FR.json'
import ptPT from './locales/pt-PT.json'
import roRO from './locales/ro-RO.json'

// Dayjs locale imports
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import 'dayjs/locale/ja'
import 'dayjs/locale/ru'
import 'dayjs/locale/de'
import 'dayjs/locale/el'
import 'dayjs/locale/es'
import 'dayjs/locale/fr'
import 'dayjs/locale/pt'
import 'dayjs/locale/ro'

const resources = {
  'en-US': { translation: enUS },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  'ja-JP': { translation: jaJP },
  'ru-RU': { translation: ruRU },
  'de-DE': { translation: deDE },
  'el-GR': { translation: elGR },
  'es-ES': { translation: esES },
  'fr-FR': { translation: frFR },
  'pt-PT': { translation: ptPT },
  'ro-RO': { translation: roRO }
}

const DAYJS_LOCALE_MAP: Record<string, string> = {
  'en-US': 'en',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  'ja-JP': 'ja',
  'ru-RU': 'ru',
  'de-DE': 'de',
  'el-GR': 'el',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'pt-PT': 'pt',
  'ro-RO': 'ro'
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  },
  missingKeyHandler: (_lngs, _ns, key) => {
    window.api?.app?.log('warn', 'i18n', `Missing translation key: ${key}`)
  }
})

i18n.on('languageChanged', (lng) => {
  const dayjsLocale = DAYJS_LOCALE_MAP[lng] ?? 'en'
  dayjs.locale(dayjsLocale)
})

export default i18n
