import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  getDocs,
  where,
  query,
  collection,
  onSnapshot,
  runTransaction,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { SurveyAnswersPayload } from "../types/app";
import type { FormValues } from "../routes/admin/settings";
import { toSeconds } from "../lib/helpers/dateTime.helper";

/**
 * Append a user's survey answers to an experiment document under `surveyAnswers` array.
 * Defaults to experiment id to match current usage.
 */
export async function saveSurveyAnswers(
  userId: string,
  answers: Record<string, unknown>,
  experimentId: string = "exp1"
) {
  const expRef = doc(db, "experiments", experimentId);
  const payload: SurveyAnswersPayload = {
    userId,
    createdAt: new Date(),
    answers,
  };
  const snap = await getDoc(expRef);
  if (!snap.exists()) {
    await setDoc(expRef, { surveyAnswers: [payload] }, { merge: true });
    return;
  }
  const data = snap.data() as any;
  const current: any[] = Array.isArray(data?.surveyAnswers)
    ? data.surveyAnswers
    : [];
  const filtered = current.filter((entry) => entry && entry.userId !== userId);
  await updateDoc(expRef, { surveyAnswers: [...filtered, payload] });
}

export async function getAllExperimentGroups(expId: string) {
  const groupsRef = query(
    collection(db, "groups"),
    where("experimentId", "==", expId)
  );
  const groupsDocs = await getDocs(groupsRef);
  return groupsDocs.docs.map((d) => ({
    groupId: d.id,
    groupName: (d.data() as any).name,
    users: (d.data() as any).users ?? [],
  }));
}

/** Fetch the experiment document. Returns null if not found. */
export async function getExperiment(expId: string) {
  const ref = doc(db, "experiments", expId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as any;
}

export async function saveExperementSettings(
  expId: string,
  values: FormValues,
  totalDuration: number
) {
  const payload = {
    settings: {
      usersInGroup: Number(values.usersInGroup) || 0,
      totalDuration,
    },
    ChatMessagesplan: values.messages.map((m) => ({
      groupType: m.groupType,
      message: m.message,
      timeInChat: toSeconds(m.at),
    })),
    ChatTimersplan: values.timers.map((t) => ({ time: toSeconds(t.time) })),
    updatedAt: new Date().toISOString(),
  } as const;

  // Persist to Firestore under experiments
  await setDoc(doc(db, "experiments", expId), payload, { merge: true });
}

/** Listen to groups under an experiment; returns Unsubscribe. */
export function listenExperimentGroups(
  expId: string,
  onChange: (
    groups: {
      groupId: string;
      groupName: string;
      users?: string[];
      groupType?: string;
      createdAt?: any;
      startedAt?: any;
    }[]
  ) => void
): Unsubscribe {
  const q = query(collection(db, "groups"), where("experimentId", "==", expId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({
      groupId: d.id,
      groupName: (d.data() as any).name,
      users: (d.data() as any).users ?? [],
      groupType: (d.data() as any).groupType,
      createdAt: (d.data() as any).createdAt,
      startedAt: (d.data() as any).startedAt,
    }));
    onChange(list);
  });
}

/** Listen to a single group document; returns Unsubscribe. */
export function listenGroup(
  groupId: string,
  onChange: (
    group: {
      groupId: string;
      groupType?: string;
      createdAt?: any;
      startedAt?: any;
    } | null
  ) => void
): Unsubscribe {
  const ref = doc(db, "groups", groupId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data() as any;
    onChange({
      groupId: snap.id,
      groupType: data?.groupType,
      createdAt: data?.createdAt,
      startedAt: data?.startedAt,
    });
  });
}

/** Transactionally send an admin message once per plan item. */
function sanitizeKey(v: string): string {
  return String(v).replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function sendAdminMessageOnce(
  groupId: string,
  text: string,
  options?: { planVersion?: string; planIndex?: number }
): Promise<boolean> {
  const ref = doc(db, "groups", groupId);
  const planVersion = sanitizeKey(options?.planVersion ?? "default");
  const planIndex = options?.planIndex ?? -1;
  const markerPath = `automation.sent.${planVersion}.${planIndex}`;
  const messageId = `${planVersion}:${planIndex}`;

  const res = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = (snap.data() as any) || {};
    // If message already present (e.g., from another admin), mark and skip
    const hasMessage = Array.isArray(data.messages)
      ? data.messages.some((m: any) => m?.messageId === messageId)
      : false;
    const already = !!markerPath
      .split(".")
      .reduce(
        (acc: any, key) => (acc && acc[key] != null ? acc[key] : undefined),
        data
      );
    if (already || hasMessage) {
      // Ensure marker exists if message exists
      if (!already && hasMessage) {
        const automation = { ...(data.automation || {}) };
        automation.sent = automation.sent || {};
        automation.sent[planVersion] = automation.sent[planVersion] || {};
        automation.sent[planVersion][String(planIndex)] = true;
        tx.set(ref, { automation }, { merge: true });
      }
      return false;
    }
    const messages = Array.isArray(data.messages) ? data.messages.slice() : [];
    messages.push({
      senderId: "admin",
      senderName: "admin",
      isAdmin: true,
      createdAt: Timestamp.now(),
      text,
      messageId,
    });
    const automation = { ...(data.automation || {}) };
    automation.sent = automation.sent || {};
    automation.sent[planVersion] = automation.sent[planVersion] || {};
    automation.sent[planVersion][String(planIndex)] = true;
    tx.set(ref, { messages, automation }, { merge: true });
    return true;
  });
  return res;
}
