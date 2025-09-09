import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Chat from "../../components/chat/Chat";
import { listenExperimentGroups } from "../../services/experimentService";
import { useExperiment } from "../../context/ExperimentContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { exportExperimentToXlsx } from "../../services/exportService";

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
      await exportExperimentToXlsx(experimentId, {
        filename: `export-all-${experimentId}-${new Date().getTime()}`,
      });
    } catch (e) {
      console.error("Failed to export", e);
      alert(t("pages.exportFailed"));
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
            {t("pages.adminSelectGroup")}
          </div>
        )}
      </div>
    </div>
  );
}
