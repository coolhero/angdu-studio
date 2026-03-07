import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ko'
import 'dayjs/locale/ja'
import 'dayjs/locale/ru'
import 'dayjs/locale/de'
import 'dayjs/locale/el'
import 'dayjs/locale/es'
import 'dayjs/locale/fr'
import 'dayjs/locale/pt'
import 'dayjs/locale/ro'

const localeMap: Record<string, string> = {
  'en-US': 'en',
  'ko-KR': 'ko',
  'ja-JP': 'ja',
  'ru-RU': 'ru',
  'de-DE': 'de',
  'el-GR': 'el',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'pt-PT': 'pt',
  'ro-RO': 'ro'
}

export function setDayjsLocale(locale: string): void {
  const dayjsLocale = localeMap[locale] ?? 'en'
  dayjs.locale(dayjsLocale)
}

export { dayjs }
