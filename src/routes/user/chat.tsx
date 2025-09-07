import { useTranslation } from "react-i18next";
import { postOrGetUserId } from "../../services/authService";
import { useLocalStorage } from "../../hooks/useLocalStorage";

// Route data loader
export async function loader() {
  const [userId] = useLocalStorage({"key":'userId',"initialValue":""})
  if (!userId) {
    return null;
  }
  return postOrGetUserId(userId);
}
export default function UserChat() {
  const { t } = useTranslation();
  return <div className="p-4">{t("pages.userChat")}</div>;
}
