import { useTranslation } from "react-i18next";

export default function UserIndex() {
  const { t } = useTranslation();
  return <div className="p-4">{t("pages.userHome")}</div>;
}

