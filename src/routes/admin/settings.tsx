import { useTranslation } from "react-i18next";

export default function AdminSettings() {
  const { t } = useTranslation();
  return <div className="p-4">{t("pages.adminSettings")}</div>;
}
