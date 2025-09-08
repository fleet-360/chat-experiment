import { useTranslation } from "react-i18next";
import Chat from "../../components/chat/Chat";
import { getAllExperimentGroups } from "../../services/experimentService";
import { useLoaderData } from "react-router";

export async function loader() {
  return getAllExperimentGroups("exp1")
}

export default function AdminChat() {
  const groups = useLoaderData()
  const { t } = useTranslation();
  return <div className="p-4">
    <Chat groupId={groups?.[0].groupId} isAdmin={true}  />
  </div>;
}
