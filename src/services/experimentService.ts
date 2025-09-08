import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export type SurveyAnswersPayload = {
  userId: string;
  createdAt: Date;
  answers: Record<string, unknown>;
};

/**
 * Append a user's survey answers to an experiment document under `surveyAnswers` array.
 * Defaults to experiment id "exp1" to match current usage.
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
  const current: any[] = Array.isArray(data?.surveyAnswers) ? data.surveyAnswers : [];
  const filtered = current.filter((entry) => entry && entry.userId !== userId);
  await updateDoc(expRef, { surveyAnswers: [...filtered, payload] });
}
