import type { GroupMessage } from "../../types/app";
import { useTranslation } from "react-i18next";

export default function MessageItem({
  message,
}: {
  message: GroupMessage & { text?: string };
}) {
  const { t } = useTranslation();
  const initial = message.senderName?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium select-none">
        {initial}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">
            {message.senderName || message.senderId}
          </span>
          {message.isAdmin && (
            <span className="text-xs rounded bg-secondary px-1.5 py-0.5">
              {t("chat.admin")}
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed break-words">
          {message.text ?? "—"}
        </div>
      </div>
    </div>
  );
}
