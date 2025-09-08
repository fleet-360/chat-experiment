import { useEffect, useState } from "react";
import Chat from "../../components/chat/Chat";
import { getAllExperimentGroups } from "../../services/experimentService";
import { useLoaderData } from "react-router";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function loader() {
  return getAllExperimentGroups("exp1")
}

export default function AdminChat() {
  const groups = useLoaderData() as { groupId: string; groupName: string; users?: string[] }[];
  const [selected, setSelected] = useState<string | undefined>(groups?.[0]?.groupId);

  useEffect(() => {
    if (!selected && groups?.length) setSelected(groups[0].groupId);
  }, [groups, selected]);

  const onExportAll = async () => {
    try {
      const fullGroups: any[] = [];
      for (const g of groups || []) {
        const snap = await getDoc(doc(db, "groups", g.groupId));
        fullGroups.push({ id: g.groupId, ...(snap.data() || {}) });
      }
      const payload = { exportedAt: new Date().toISOString(), groups: fullGroups };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-all-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
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
        />
        {selected ? (
          <Chat groupId={selected} isAdmin={true} />
        ) : (
          <div className="border rounded-md p-4 text-sm text-muted-foreground">Select a group to view chat</div>
        )}
      </div>
    </div>
  );
}
