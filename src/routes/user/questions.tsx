import { useTranslation } from "react-i18next";

export default function UserQuestions() {
  const { t } = useTranslation();
  return <div className="p-4">{t("pages.userQuestions")}</div>;
}
