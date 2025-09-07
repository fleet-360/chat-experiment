import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const dir = i18n.dir();
    const lang = i18n.language;
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [i18n, i18n.language]);

  const change = async (lng: "en" | "he") => {
    await i18n.changeLanguage(lng);
    const dir = i18n.dir(lng);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lng);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="opacity-70">{t("lang.switchTo")}:</span>
      <button
        type="button"
        className={`underline ${i18n.language.startsWith("en") ? "font-bold" : ""}`}
        onClick={() => change("en")}
      >
        {t("lang.english")}
      </button>
      <span>·</span>
      <button
        type="button"
        className={`underline ${i18n.language.startsWith("he") ? "font-bold" : ""}`}
        onClick={() => change("he")}
      >
        {t("lang.hebrew")}
      </button>
    </div>
  );
}

