import { readFileSync } from 'fs'
import { join } from 'path'

type Translations = Record<string, Record<string, string>>

let currentLocale = 'en-US'
let translations: Record<string, Translations> = {}

function loadLocale(locale: string): Translations {
  if (translations[locale]) return translations[locale]

  try {
    // In packaged app, locales are in resources
    const localePath = join(__dirname, `../../renderer/src/i18n/locales/${locale.toLowerCase()}.json`)
    const content = readFileSync(localePath, 'utf-8')
    translations[locale] = JSON.parse(content)
    return translations[locale]
  } catch {
    // Fallback to empty
    return {}
  }
}

export function setLocale(locale: string): void {
  currentLocale = locale
  loadLocale(locale)
}

export function t(key: string): string {
  const data = loadLocale(currentLocale)
  const parts = key.split('.')

  let current: unknown = data
  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[part]
    } else {
      return key
    }
  }

  return typeof current === 'string' ? current : key
}

export function getLocale(): string {
  return currentLocale
}
