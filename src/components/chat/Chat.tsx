import { useEffect, useMemo, useRef, useState } from "react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Group, GroupMessage } from "../../types/app";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import ChatInput from "./ChatInput";
import { useTranslation } from "react-i18next";
import MessageItem from "./MessageItem";
import { Button } from "../ui/button";
import { exportGroupsToXlsx } from "../../services/exportService";
import { useNavigate } from "react-router";
import { ElapsedTimer } from "./ElapsedTimer";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toDate } from "../../lib/helpers/dateTime.helper";
import { useExperiment } from "../../context/ExperimentContext";
import { useAdminAutomationScheduler } from "../../services/adminAutomation";

export type ChatProps = {
  groupId: string;
  title?: string;
  className?: string;
  isAdmin?: boolean;
};

export default function Chat({
  groupId,
  className,
  isAdmin = false,
}: ChatProps) {
  const [messages, setMessages] = useState<
    (GroupMessage & { text?: string })[]
  >([]);
  const experiment = useExperiment();
  const [group, setGroup] = useState<Group | undefined>(undefined);
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);
  const [isTimeOut, setIsTimeOut] = useState(false);
  const navigate = useNavigate();
  useAdminAutomationScheduler(groupId, isTimeOut);

  useEffect(() => {
    if (!groupId) return;
    setIsTimeOut(false);
    const ref = doc(db, "groups", groupId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as Group | undefined;
      setMessages(Array.isArray(data?.messages) ? data!.messages : []);
      setGroup(data);
    });
    return () => unsub();
  }, [groupId]);

  const headerTitle = useMemo(
    () => group?.name ?? t("chat.groupTitle", { id: groupId }),
    [group?.name, groupId, t]
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

  // Start time: only when group is full (startedAt). Until then show waiting message.
  const startDate = useMemo(() => {
    if ((group as any)?.startedAt) return toDate((group as any).startedAt);
    return null;
  }, [group?.experimentId, (group as any)?.startedAt]);

  const capacity = experiment.data?.settings?.usersInGroup ?? 4;
  const usersCount = group?.users?.length ?? 0;
  const remainingToStart = Math.max(capacity - usersCount, 0);

  return (
    <Card className={className}>
      <CardHeader className="bg-muted border-b-2 ">
        <div className="flex items-center justify-between gap-3 pb-4">
          <CardTitle>
            {headerTitle}
            <br />
            {isAdmin && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="block text-muted-foreground text-sm max-w-sm truncate ">
                    {group?.users
                      .map((id) => `${t("chat.prolificIdPrefix")}${id}`)
                      .join(", ")}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className=" ">
                    {group?.users
                      .map((id) => `${t("chat.prolificIdPrefix")}${id}`)
                      .join(", ")}
                  </span>
                </TooltipContent>
              </Tooltip>
            )}
            {/* <span className="block text-muted-foreground text-sm max-w-10/12 truncate ">
              {isAdmin &&
                group?.users.map((id) => `PROLIFIC_ID-${id}`).join(", ")}
            </span> */}
          </CardTitle>

          <div className="flex items-center gap-2">
            {isAdmin && groupId ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  try {
                    await exportGroupsToXlsx([{ groupId }], {
                      filename: `${experiment.data?.id}-${
                        group?.name
                      }-${new Date().getTime()}`,
                    });
                  } catch (e) {
                    console.error("Failed to export group", e);
                  }
                }}
                aria-label={t("chat.exportGroup")}
              >
                {t("chat.exportGroup")}
              </Button>
            ) : null}
            {startDate ? (
              <ElapsedTimer
                start={startDate}
                timers={experiment.data?.ChatTimersplan.map(
                  (timer) => timer.time
                )}
                className="text-sm text-muted-foreground"
                onComplete={() => setIsTimeOut(true)}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                {t("chat.waitingForUsers", { count: remainingToStart })}
              </div>
            )}
            {/* <Button
              size="sm"
              variant="link"
              onClick={() => navigate("/user/survey")}
            >
              {t("nav.questions")}
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ backgroundColor: "#e0f7e9" }}>
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex flex-col gap-3 h-[50vh] overflow-y-auto pe-2 pt-4"
        >
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("chat.noMessages")}
            </div>
          ) : (
            messages
              .slice()
              .sort((a, b) => {
                const va = toDate(a.createdAt)?.getTime?.() ?? 0;
                const vb = toDate(b.createdAt)?.getTime?.() ?? 0;
                return va - vb;
              })
              .map((m, idx) => <MessageItem key={idx} message={m} />)
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 py-2 ">
        {!isTimeOut ? (
          <ChatInput
            placeholder={t("chat.placeholder")}
            showAdminSwitch={isAdmin}
            onSend={async (value, opts) => {
              value = value.trim();
              if (!value) return;
              if (!groupId) return;
              try {
                const senderId = isAdmin
                  ? "user-admin"
                  : (typeof window !== "undefined" &&
                      localStorage.getItem("userId")) ||
                    "anonymous";
                const userIndex = Number(
                  group?.users?.findIndex((id: string) => id == senderId)
                );
                console.log("userIndex", userIndex);
                const asAdmin = !!opts?.asAdmin && isAdmin;
                const senderName = asAdmin
                  ? "admin"
                  : "user-" +
                    (userIndex > -1
                      ? userIndex + 1
                      : (experiment.data?.settings?.usersInGroup ?? 0) + 1);
                const gRef = doc(db, "groups", groupId);
                await updateDoc(gRef, {
                  messages: arrayUnion({
                    senderId,
                    senderName,
                    isAdmin: asAdmin,
                    createdAt: Timestamp.now(),
                    text: value,
                  }),
                });
              } catch (err) {
                console.error("Failed to send message", err);
              }
            }}
            withEmojy={group?.groupType !== "noEmojy" || isAdmin}
            className="w-full"
          />
        ) : (
          <div className="w-full flex items-center justify-between gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              {t("chat.sessionEnded")}
            </p>
            <Button
              size="sm"
              variant={"link"}
              onClick={() => navigate("/user/survey")}
            >
              {t("pages.goToSurvey")}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
