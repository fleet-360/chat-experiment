import { useEffect, useMemo, useState } from "react";
import { arrayUnion, doc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { GroupMessage } from "../../types/app";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
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

  const headerTitle = useMemo(() =>  groupName ?? `Group ${groupId}`,[ groupName, groupId]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{headerTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
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
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
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
          className="flex w-full items-start gap-2"
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="min-h-[60px] flex-1"
          />
          <Button type="submit" disabled={sending || !text.trim()}>
            {t("chat.send")}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
