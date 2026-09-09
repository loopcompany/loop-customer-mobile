import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import en from '@assets/locales/en.json';
import fa from '@assets/locales/fa.json';

/**
 * Layout stays left-to-right even though the content is Persian. This is a
 * deliberate product decision, not an oversight — see CLAUDE.md. Flipping it
 * would mirror every screen in the app.
 */
I18nManager.forceRTL(false);

i18n.use(initReactI18next).init({
  resources: {
    fa: { translation: fa },
    en: { translation: en },
  },
  lng: 'fa',
  fallbackLng: 'fa',
  interpolation: { escapeValue: false },
});

export default i18n;
