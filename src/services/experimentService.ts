import { doc, updateDoc, getDoc, setDoc, getDocs, where, query, collection } from "firebase/firestore";
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
  experimentId: string 
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
  const current: any[] = Array.isArray(data?.surveyAnswers) ? data.surveyAnswers : [];
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
  expId:string,
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
