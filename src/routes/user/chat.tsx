import { useTranslation } from "react-i18next";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { postOrGetUserId } from "../../services/authService";

// Route data loader
export async function loader(data: LoaderFunctionArgs) {
  const url = new URL(data.request.url);
  const userId = url.searchParams.get("PROLIFIC_PID");
  if (!userId) {
    return null;
  }
  return postOrGetUserId(userId);
}
export default function UserChat() {
  const { t } = useTranslation();
  return <div className="p-4">{t("pages.userChat")}</div>;
}
