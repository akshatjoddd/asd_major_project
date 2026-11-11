// i18next setup: English and Hindi, one default namespace, no language detector.
// The chosen language is persisted in localStorage and also drives <html lang>.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';

export const SUPPORTED_LANGUAGES = ['en', 'hi'];
const STORAGE_KEY = 'museumx.lang';

export function storedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: storedLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

let current = i18n.language;
i18n.on('languageChanged', (language) => {
  current = language;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    /* storage disabled */
  }
  document.documentElement.lang = language;
});

document.documentElement.lang = current;

export default i18n;
