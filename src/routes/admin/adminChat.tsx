import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Chat from "../../components/chat/Chat";
import { listenExperimentGroups } from "../../services/experimentService";
import { useExperiment } from "../../context/ExperimentContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminChat() {
  const { experimentId } = useExperiment();
  const [groups, setGroups] = useState<
    { groupId: string; groupName: string; users?: string[] }[]
  >([]);

  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | undefined>(
    groups?.[0]?.groupId
  );

  useEffect(() => {
    const unsub = listenExperimentGroups(experimentId, (list) => {
      setGroups(list);
      if (!selected && list?.length) setSelected(list[0].groupId);
    });
    return () => unsub();
  }, [experimentId, selected]);

  const onExportAll = async () => {
    try {
      const fullGroups: any[] = [];
      for (const g of groups || []) {
        const snap = await getDoc(doc(db, "groups", g.groupId));
        fullGroups.push({ id: g.groupId, ...(snap.data() || {}) });
      }
      const payload = {
        exportedAt: new Date().toISOString(),
        groups: fullGroups,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-all-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export", e);
      alert("Export failed. See console for details.");
    }
  };

  return (
    <div className="p-4">
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <AdminSidebar
          groups={groups || []}
          value={selected}
          onChange={setSelected}
          onExportAll={onExportAll}
          experimentName={experimentId}
        />
        {selected ? (
          <Chat groupId={selected} isAdmin={true} />
        ) : (
          <div className="border rounded-md p-4 text-sm text-muted-foreground">
            {t("admin.selectGroup", {
              defaultValue: "Select a group to view chat",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
