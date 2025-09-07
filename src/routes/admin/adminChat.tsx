import { useTranslation } from "react-i18next";

export default function AdminChat() {
  const { t } = useTranslation();
  return <div className="p-4">{t("pages.adminChat")}</div>;
}
