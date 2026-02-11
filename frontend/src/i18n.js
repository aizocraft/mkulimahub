import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'sw'], // Explicitly allow English and Kiswahili
    
    // Namespaces: these match your JSON filenames
    ns: ['home', 'nav'], 
    defaultNS: 'home', 

    backend: {
      // The {{ns}} variable tells i18next which file to fetch
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['path', 'cookie', 'htmlTag', 'localStorage'],
      caches: ['localStorage', 'cookie'],
    },

    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;