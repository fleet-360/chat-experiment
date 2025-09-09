import { useEffect, useMemo, useState } from "react";
import { useExperiment } from "../context/ExperimentContext";
import { listenExperimentGroups, listenGroup, sendAdminMessageOnce } from "./experimentService";
import { toDate } from "../lib/helpers/dateTime.helper";
import type { ChatMessagePlanItem, ChatGroupType } from "../types/app";

function derivePlanVersion(expData: any): string {
  const base = expData?.updatedAt || expData?.settings?.totalDuration || "v1";
  const count = Array.isArray(expData?.ChatMessagesplan)
    ? expData.ChatMessagesplan.length
    : 0;
  return String(base) + ":" + count;
}

export function useAdminAutomationScheduler(currentGroupId?: string) {
  const enabled = true
  const { experimentId, data } = useExperiment();
  const plan: ChatMessagePlanItem[] = useMemo(
    () => (Array.isArray(data?.ChatMessagesplan) ? data!.ChatMessagesplan : []),
    [data]
  );
  const planVersion = useMemo(() => derivePlanVersion(data), [data]);
  const [groups, setGroups] = useState<
    { groupId: string; groupType?: ChatGroupType; createdAt?: any }[]
  >([]);

  // Listen to groups (scope to current group when provided)
  useEffect(() => {
    if (!enabled) return;
    if (currentGroupId) {
      const unsub = listenGroup(currentGroupId, (g) => {
        if (!g) {
          setGroups([]);
          return;
        }
        setGroups([{ groupId: g.groupId, groupType: g.groupType as any, createdAt: g.createdAt }]);
      });
      return () => unsub();
    }
    const unsub = listenExperimentGroups(experimentId, (list) => {
      setGroups(list.map((g) => ({ groupId: g.groupId, groupType: g.groupType as any, createdAt: g.createdAt })));
    });
    return () => unsub();
  }, [enabled, experimentId, currentGroupId]);

  // Tick and dispatch due messages
  const inFlight = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    if (!enabled) return;
    if (!plan.length) return;
    const id = window.setInterval(async () => {
      const now = Date.now();
      for (const g of groups) {
        const created = toDate(g.createdAt);
        if (!created) continue;
        const elapsed = Math.floor((now - created.getTime()) / 1000);
        const due = plan
          .map((p, idx) => ({ p, idx }))
          .filter(({ p }) => (!g.groupType || p.groupType === g.groupType) && p.timeInChat <= elapsed);
        for (const { p, idx } of due) {
          const key = `${g.groupId}|${planVersion}|${idx}`;
          if (inFlight.has(key)) continue;
          inFlight.add(key);
          try {
            await sendAdminMessageOnce(g.groupId, p.message, {
              planVersion,
              planIndex: idx,
            });
          } catch (e) {
            console.error("automation send failed", e);
          } finally {
            inFlight.delete(key);
          }
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled, plan, planVersion, groups, inFlight]);
}
