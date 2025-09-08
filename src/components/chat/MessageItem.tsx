import type { GroupMessage } from "../../types/app";
import { useTranslation } from "react-i18next";

export default function MessageItem({
  message,
}: {
  message: GroupMessage & { text?: string };
}) {
  const { t } = useTranslation();
  const myId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isAdmin = !!message.isAdmin;
  const isMine = !isAdmin && myId && message.senderId === myId;

  // Alignment per requirement (respecting RTL via CSS logical start/end on flex):
  // - mine: start, - others: end, - admin: center
  const justify = isAdmin ? "justify-center" : isMine ? "justify-start" : "justify-end";

  const bubbleBase = "max-w-xl  rounded-xl px-3 py-2 text-sm shadow-sm break-words";
  const bubbleVariant = isAdmin
    ? "bg-secondary text-secondary-foreground"
    : isMine
    ? "bg-primary text-primary-foreground"
    : "bg-muted text-foreground";

  const nameMuted = isAdmin ? "text-foreground/80" : "text-foreground/90";

  return (
    <div className={`flex w-full ${justify}`}>
      <div className="flex flex-col  items-stretch gap-1">
        <div className={`text-xs ${nameMuted}`}>
          <span className="font-medium">
            {message.senderName || message.senderId}
          </span>
          {isAdmin && (
            <span className="ms-2 text-[11px] rounded bg-secondary px-1.5 py-0.5 align-middle">
              {t("chat.admin")}
            </span>
          )}
        </div>
        <div className={`${bubbleBase} ${bubbleVariant}`}>
          {message.text ?? "—"}
        </div>
      </div>
    </div>
  );
}
