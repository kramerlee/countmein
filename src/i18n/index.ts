import { createI18n } from 'vue-i18n'
import vi from './locales/vi'
import en from './locales/en'

export type Locale = 'vi' | 'en'

// Get saved locale or default to Vietnamese
function getDefaultLocale(): Locale {
  const saved = localStorage.getItem('countmein_locale')
  if (saved === 'vi' || saved === 'en') {
    return saved
  }
  // Default to Vietnamese
  return 'vi'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  messages: {
    vi,
    en
  }
})

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('countmein_locale', locale)
  document.documentElement.lang = locale
}

export function getLocale(): Locale {
  return i18n.global.locale.value as Locale
}

export default i18n

