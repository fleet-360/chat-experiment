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
        chat: {
          noMessages: "No messages yet.",
          placeholder: "Type your message",
          send: "Send",
          admin: "Admin",
          missingGroup: "Missing group assignment for user. Please return to consent.",
          noGroupOnUser: "No group found on user.",
        },
        consent: {
        intro: "Hello and welcome to this survey.",
        readConsent: "Before you begin, please read the consent form on this page.",
        statement: {
          title: "📝 Consent Statement",
          p1:
            "You are participating in a study being performed by researchers from The Coller School of Management at Tel Aviv University. Your participation in this research is voluntary. You may decline to answer any or all of the following questions. You may decline further participation at any time, without adverse consequences.",
          p2:
            "Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you. If you have any questions about the research, you can contact the principal researcher, Prof. Shai Danziger at shaid@tauex.tau.ac.il",
        },
        about: {
          title: "🔍 About the Study",
          p1:
            "In this study, you’ll take part in a short online group activity. After giving your consent, you’ll receive a link that will take you to a group chatroom built especially for this research. You’ll be randomly placed in a small group with other participants. Once your group is ready, you’ll work together on a fun creativity task: first, coming up with as many different uses as you can for a common object, and then deciding together which idea is the most creative.",
          p2:
            "After completing the task, you will also be asked a series of questions about it and about yourself.",
          p3:
            "During the task, your conversations will be recorded and analyzed for research purposes. All data will be stored securely and used only in anonymized form, so that no individual participant can be identified.",
        },
        cta: {
          accept: "Agree",
          decline: "Disagree",
        },
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
        chat: {
          noMessages: "אין הודעות עדיין.",
          placeholder: "הקלד/י הודעה",
          send: "שליחה",
          admin: "מנהל",
          missingGroup: "חסרה שיוכות לקבוצה עבור המשתמש. אנא חזרו למסך ההסכמה.",
          noGroupOnUser: "לא נמצאה קבוצה למשתמש.",
        },
        consent: {
        intro: "שלום וברוכים הבאים לסקר זה.",
        readConsent: "לפני שתתחילו, אנא קראו את טופס ההסכמה בעמוד זה.",
        statement: {
          title: "📝 הצהרת הסכמה",
          p1:
            "אתם משתתפים במחקר שמבוצע על ידי חוקרים מבית הספר לניהול ע״ש קולר באוניברסיטת תל‑אביב. ההשתתפות במחקר היא וולונטרית. תוכלו להימנע מלענות על כל או חלק מן השאלות. ניתן להפסיק את ההשתתפות בכל עת, ללא השלכות לרעתכם.",
          p2:
            "אנונימיותכם מובטחת; החוקרים שביקשו את השתתפותכם לא יקבלו מידע אישי אודותיכם. לשאלות בנוגע למחקר ניתן לפנות לחוקר הראשי, פרופ׳ שי דנציגר, ב‑shaid@tauex.tau.ac.il",
        },
        about: {
          title: "🔍 אודות המחקר",
          p1:
            "במחקר זה תשתתפו בפעילות קבוצתית מקוונת קצרה. לאחר מתן ההסכמה תקבלו קישור שיוביל אתכם לחדר צ'אט קבוצתי שנבנה במיוחד למחקר זה. תשובצו באקראי לקבוצה קטנה עם משתתפים נוספים. כאשר הקבוצה תהיה מוכנה, תעבדו יחד על משימת יצירתיות מהנה: תחילה תחשבו על כמה שיותר שימושים שונים עבור חפץ יומיומי, ולאחר מכן תחליטו יחד איזו מן ההצעות היא היצירתית ביותר.",
          p2:
            "לאחר השלמת המשימה תתבקשו לענות על סדרת שאלות אודותיה ואודות עצמכם.",
          p3:
            "במהלך המשימה, השיחות יתועדו וינותחו למטרות מחקר. כל הנתונים יאוחסנו באופן מאובטח ויעובדו בצורה מונגנבת בלבד, כך שלא ניתן יהיה לזהות משתתף בודד.",
        },
        cta: {
          accept: "אני מסכים/מה",
          decline: "אינני מסכים/מה",
        },
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
