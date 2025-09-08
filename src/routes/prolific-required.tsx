import { useTranslation } from "react-i18next";

export default function ProlificRequired() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-4">{t("pages.prolificRequiredTitle")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("pages.prolificRequiredMessage")}
      </p>
    </div>
  );
}
