import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLang = (() => {
  try {
    const language = localStorage.getItem('youCalendy_selectedLanguage');
    return language === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
})();

const loadedLanguages = new Set(['en']);

const resources = {
  en: {
    translation: {
      'Your ticket notification': 'Your ticket notification',
      'Your ticket': 'Your ticket',
      'You have {count} active ticket{s}': 'You have {count} active ticket{s}',
      'Ticket Notifications': 'Ticket Notifications',
    },
  },
};

export async function ensureLanguageResources(language) {
  if (language !== 'es' || loadedLanguages.has(language)) {
    return;
  }

  const { default: esTranslations } = await import('./locales/esTranslations.js');
  i18n.addResourceBundle(language, 'translation', esTranslations, true, true);
  loadedLanguages.add(language);
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false, prefix: '{', suffix: '}' },
});

if (savedLang === 'es') {
  void ensureLanguageResources('es').then(() => i18n.changeLanguage('es'));
}

export default i18n;
