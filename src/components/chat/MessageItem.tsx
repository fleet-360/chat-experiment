import type { GroupMessage } from "../../types/app";
import { useTranslation } from "react-i18next";

export default function MessageItem({
  message,
}: {
  message: GroupMessage & { text?: string };
}) {
  const { t, i18n } = useTranslation();
  const myId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isAdmin = !!message.isAdmin;
  const isMine = !isAdmin && myId && message.senderId === myId;

  // Alignment per requirement (respecting RTL via CSS logical start/end on flex):
  // - mine: start, - others: end, - admin: center
  const justify = isAdmin
    ? "justify-center"
    : isMine
    ? "justify-start"
    : "justify-end";

  const bubbleBase =
    "max-w-xl  rounded-xl px-3 py-2 text-sm shadow-sm break-words";
  const bubbleVariant = isAdmin
    ? "bg-[var(--chat-bubble-admin)] text-foreground"
    : isMine
    ? "bg-[var(--chat-bubble-mine)] text-foreground"
    : "bg-[var(--chat-bubble-other)] text-foreground";

  const nameMuted = isAdmin ? "text-foreground/80" : "text-foreground/90";

  // Format timestamp from Firestore Timestamp or Date
  const timeLabel = (() => {
    const v: any = (message as any).createdAt;
    let d: Date | null = null;
    if (
      v &&
      typeof v === "object" &&
      "seconds" in v &&
      typeof (v as any).seconds === "number"
    ) {
      d = new Date((v as any).seconds * 1000);
    } else if (v instanceof Date) {
      d = v;
    }
    return d
      ? d.toLocaleTimeString(i18n.language, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  })();

  const timeAlign = isAdmin
    ? "text-center"
    : isMine
    ? "text-end"
    : "text-start";

  return (
    <div className={`flex w-full ${justify}`}>
      <div className="flex flex-col  items-stretch gap-1">
        <div className={`text-xs ${nameMuted}`}>
          {isAdmin ? (
            <span className="block text-center font-medium">
              {t("chat.admin")}
            </span>
          ) : (
            <span className="font-medium">
              {message.senderName || message.senderId}
            </span>
          )}
        </div>
        <div className={`${bubbleBase} ${bubbleVariant}`}>
          {message.text ?? "—"}
          {timeLabel && (
            <p className={`ms-2 text-[11px] opacity-70 ${timeAlign} `}>
              {timeLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
