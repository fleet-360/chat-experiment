import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import Chat from "../../components/chat/Chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { postOrGetUserId } from "../../services/authService";

// Route data loader
export async function loader() {
  const userId = localStorage.getItem('userId')
  if (!userId) {
    return null;
  }
  return postOrGetUserId(userId);
}

export default function UserChat() {
  const { t } = useTranslation();

  const data = useLoaderData()

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.userChat")}</CardTitle>
            <CardDescription>
              {t("chat.missingGroup")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{t("chat.noGroupOnUser")}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Chat groupId={data?.group} />
    </div>
  );
}
