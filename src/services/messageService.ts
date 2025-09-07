import { db } from "../lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";

export type SendMessageInput = {
  chatId: string;
  userId: string;
  text: string;
  // Additional arbitrary metadata for the message (optional)
  meta?: Record<string, unknown>;
};

// Writes a message to `chats/{chatId}/messages` and updates chat summary.
export async function sendMessage(input: SendMessageInput): Promise<string> {
  const chatId = input.chatId.trim();
  const userId = input.userId.trim();
  const text = input.text.trim();

  if (!chatId) throw new Error("chatId is required");
  if (!userId) throw new Error("userId is required");
  if (!text) throw new Error("text is required");
  if (text.length > 4000) throw new Error("text exceeds 4000 characters");

  const messagesCol = collection(db, "chats", chatId, "messages");

  const messageDoc = await addDoc(messagesCol, {
    text,
    userId,
    createdAt: serverTimestamp(),
    ...("meta" in input && input.meta ? { meta: input.meta } : {}),
  });

  // Best-effort: update chat summary for listing/sorting
  try {
    const chatRef = doc(db, "chats", chatId);
    await setDoc(
      chatRef,
      {
        lastMessageText: text.slice(0, 200),
        lastMessageUserId: userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (e) {
    // Non-fatal; message was written even if summary update fails
    console.warn("Failed updating chat summary", e);
  }

  return messageDoc.id;
}

