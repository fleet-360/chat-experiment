import { useEffect, useMemo, useRef, useState } from "react";
import { arrayUnion, doc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { GroupMessage } from "../../types/app";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import ChatInput from "./ChatInput";
import { useTranslation } from "react-i18next";
import MessageItem from "./MessageItem";

export type ChatProps = {
  groupId: string;
  title?: string;
  className?: string;
};

type FirestoreGroupDoc = {
  messages?: (GroupMessage & { text?: string })[];
  name?: string;
};

export default function Chat({ groupId,  className }: ChatProps) {
  const [messages, setMessages] = useState<(GroupMessage & { text?: string })[]>([]);
  const [groupName, setGroupName] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    if (!groupId) return;
    const ref = doc(db, "groups", groupId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as FirestoreGroupDoc | undefined;
      setMessages(Array.isArray(data?.messages) ? data!.messages : []);
      setGroupName(data?.name);
    });
    return () => unsub();
  }, [groupId]);

  const headerTitle = useMemo(
    () => groupName ?? t("chat.groupTitle", { id: groupId }),
    [groupName, groupId, t]
  );

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 40;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distance <= threshold;
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: "end" });
    } else if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Initial stick-to-bottom
    isAtBottomRef.current = true;
    requestAnimationFrame(scrollToBottom);
  }, []);

  useEffect(() => {
    // Keep at bottom when user hasn't scrolled up
    if (isAtBottomRef.current) requestAnimationFrame(scrollToBottom);
  }, [messages]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{headerTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex flex-col gap-3 h-[50vh] overflow-y-auto pe-2"
        >
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">{t("chat.noMessages")}</div>
          ) : (
            messages
              .slice()
              .sort((a, b) => {
                const ta = (a.createdAt as unknown as { seconds?: number } | Date) ?? 0;
                const tb = (b.createdAt as unknown as { seconds?: number } | Date) ?? 0;
                const va = typeof ta === "object" && "seconds" in (ta as any) ? (ta as any).seconds! : (ta as Date).getTime?.() ?? 0;
                const vb = typeof tb === "object" && "seconds" in (tb as any) ? (tb as any).seconds! : (tb as Date).getTime?.() ?? 0;
                return va - vb;
              })
              .map((m, idx) => (
                <MessageItem key={idx} message={m} />
              ))
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
      <CardFooter>
        <ChatInput
          value={text}
          onChange={setText}
          disabled={sending}
          placeholder={t("chat.placeholder")}
          onSend={async () => {
            const value = text.trim();
            if (!value) return;
            if (!groupId) return;
            setSending(true);
            try {
              const senderId = (typeof window !== 'undefined' && localStorage.getItem('userId')) || 'anonymous';
              const senderName = (typeof window !== 'undefined' && localStorage.getItem('displayName')) || 'Anonymous';
              const gRef = doc(db, 'groups', groupId);
              await updateDoc(gRef, {
                messages: arrayUnion({
                  senderId,
                  senderName,
                  isAdmin: false,
                  createdAt: Timestamp.now(),
                  text: value,
                }),
              });
              setText("");
            } catch (err) {
              console.error('Failed to send message', err);
            } finally {
              setSending(false);
            }
          }}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
