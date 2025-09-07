import { useTranslation } from "react-i18next";

export default function UserChat() {
  const { t } = useTranslation();
  return <div className="p-4">{t("pages.userChat")}</div>;
}
