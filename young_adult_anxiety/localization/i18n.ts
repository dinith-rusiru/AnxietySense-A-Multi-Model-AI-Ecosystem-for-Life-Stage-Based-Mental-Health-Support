import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your language files
import en from './en.json';
import si from './si.json';
import ta from './ta.json';

const LANGUAGE_PERSISTENCE_KEY = 'user_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_PERSISTENCE_KEY);
    // If a language is saved, use it. Otherwise, default to 'en'.
    callback(savedLanguage || 'en');
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    await AsyncStorage.setItem(LANGUAGE_PERSISTENCE_KEY, language);
  },
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    react: {
      useSuspense: false, // Important for React Native
    },
  });

export default i18next;
