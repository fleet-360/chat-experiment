import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const resources = {
  en: {
    translation: {
      app: { title: "chat-experiment" },
      common: {
        userArea: "User Area",
        adminArea: "Admin Area",
        goToAdmin: "Go to Admin",
        goToUser: "Go to User",
      },
      nav: {
        home: "Home",
        chat: "Chat",
        questions: "Questions",
        settings: "Settings",
        user: "User",
        admin: "Admin",
      },
      lang: {
        english: "English",
        hebrew: "Hebrew",
        switchTo: "Language",
      },
      pages: {
        userHome: "User Home",
        userChat: "User Chat",
        userQuestions: "User Questions",
        adminSettings: "Admin Settings",
        adminChat: "Admin Chat",
      },
    },
  },
  he: {
    translation: {
      app: { title: "ניסוי צ'אט" },
      common: {
        userArea: "אזור משתמש",
        adminArea: "אזור מנהל",
        goToAdmin: "מעבר למנהל",
        goToUser: "מעבר למשתמש",
      },
      nav: {
        home: "דף הבית",
        chat: "צ'אט",
        questions: "שאלות",
        settings: "הגדרות",
        user: "משתמש",
        admin: "מנהל",
      },
      lang: {
        english: "אנגלית",
        hebrew: "עברית",
        switchTo: "שפה",
      },
      pages: {
        userHome: "דף הבית של משתמש",
        userChat: "צ'אט משתמש",
        userQuestions: "שאלות משתמש",
        adminSettings: "הגדרות מנהל",
        adminChat: "צ'אט מנהל",
      },
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "he"],
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
