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

export function useAdminAutomationScheduler(currentGroupId?: string,isTimeOut:boolean=false) {
  const enabled = !isTimeOut;
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

  // Dispatch due messages using dynamic timeout to minimize Firestore calls
  const inFlight = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    if (!enabled) return;
    if (!plan.length) return;

    let timeoutId: number | undefined;

    const tick = async () => {
      const now = Date.now();

      // 1) Send only the messages scheduled for the latest due time (avoid re-sending backlog)
      for (const g of groups) {
        const created = toDate(g.createdAt);
        if (!created) continue;
        const elapsed = Math.floor((now - created.getTime()) / 1000);
        const eligible = plan
          .map((p, idx) => ({ p, idx }))
          .filter(({ p }) => (!g.groupType || p.groupType === g.groupType) && p.timeInChat <= elapsed);

        if (!eligible.length) continue;
        const latestDueTime = Math.max(...eligible.map(({ p }) => p.timeInChat));
        const dueNow = eligible.filter(({ p }) => p.timeInChat === latestDueTime);

        for (const { p, idx } of dueNow) {
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

      // 2) Compute next wakeup based on soonest next message across all groups
      const nextDelays: number[] = [];
      const now2 = Date.now();
      for (const g of groups) {
        const created = toDate(g.createdAt);
        if (!created) continue;
        const elapsedSec = Math.floor((now2 - created.getTime()) / 1000);
        const next = plan
          .filter((p) => (!g.groupType || p.groupType === g.groupType) && p.timeInChat > elapsedSec)
          .map((p) => p.timeInChat)
          .sort((a, b) => a - b)[0];
        if (typeof next === "number") {
          const delayMs = Math.max((next - elapsedSec) * 1000, 0);
          nextDelays.push(delayMs);
        }
      }

      if (nextDelays.length === 0) {
        // Nothing upcoming; do not reschedule. Will wake on dependency changes.
        return;
      }

      const minDelay = Math.max(Math.min(...nextDelays), 0);
      timeoutId = window.setTimeout(tick, minDelay);
    };

    // Initial schedule: run immediately to flush any due items, then self-schedule
    tick();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [enabled, plan, planVersion, groups, inFlight]);
}
