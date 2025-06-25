import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "General Settings": "General Settings",
      "Language": "Language",
      "Font Size": "Font Size",
      "Preview": "Preview: This is a preview.",
      "CLOSE": "CLOSE",
      "ENGLISH": "ENGLISH",
      "HINDI": "HINDI",
      // Add more English UI text here as needed
    }
  },
  hi: {
    translation: {
      "General Settings": "सामान्य सेटिंग्स",
      "Language": "भाषा",
      "Font Size": "फ़ॉन्ट आकार",
      "Preview": "पूर्वावलोकन: यह एक पूर्वावलोकन है।",
      "CLOSE": "बंद करें",
      "ENGLISH": "अंग्रेज़ी",
      "HINDI": "हिंदी",
      // Add more Hindi UI text here as needed
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 