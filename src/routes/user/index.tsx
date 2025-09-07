import { useTranslation } from "react-i18next";
import { useLoaderData,  } from "react-router";
import { postOrGetUserId } from "../../services/authService";

export async function loader(data: any) {
  const url = new URL(data.request.url);
  const userId = url.searchParams.get("PROLIFIC_PID");
  if (!userId) {
    return null
  }
  return postOrGetUserId(userId)
 
}

export default function UserIndex() {

  const data = useLoaderData()
  console.log('data', data)

  const { t } = useTranslation();
  return <div className="p-4">{t("pages.userHome")}</div>;
}
