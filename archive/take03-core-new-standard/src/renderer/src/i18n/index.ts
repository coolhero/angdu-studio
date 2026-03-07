import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import locale resources
import enUS from './locales/en-us.json'
import koKR from './locales/ko-kr.json'
import jaJP from './locales/ja-jp.json'
import ruRU from './locales/ru-ru.json'
import deDE from './locales/de-de.json'
import elGR from './locales/el-gr.json'
import esES from './locales/es-es.json'
import frFR from './locales/fr-fr.json'
import ptPT from './locales/pt-pt.json'
import roRO from './locales/ro-ro.json'

const resources = {
  'en-US': { translation: enUS },
  'ko-KR': { translation: koKR },
  'ja-JP': { translation: jaJP },
  'ru-RU': { translation: ruRU },
  'de-DE': { translation: deDE },
  'el-GR': { translation: elGR },
  'es-ES': { translation: esES },
  'fr-FR': { translation: frFR },
  'pt-PT': { translation: ptPT },
  'ro-RO': { translation: roRO }
}

// Detect language: saved preference → navigator → default
function detectLanguage(): string {
  const saved = localStorage.getItem('cherry-studio-language')
  if (saved && saved in resources) return saved

  const navLang = navigator.language
  if (navLang in resources) return navLang

  // Try matching just the language part
  const langBase = navLang.split('-')[0]
  const match = Object.keys(resources).find((key) => key.startsWith(langBase))
  if (match) return match

  return 'en-US'
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  },
  saveMissing: true,
  missingKeyHandler: (_lngs, _ns, key) => {
    console.warn(`[i18n] Missing key: ${key}`)
  }
})

export default i18n
