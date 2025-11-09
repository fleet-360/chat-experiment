import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fromSeconds } from "../../lib/helpers/dateTime.helper";

interface WaitingChatProps {
  groupCreatedDate: Date;
  remainingUsers: number;
  onTimeout?: () => void; // placeholder callback invoked when timer ends
}

const WaitingChat = ({ remainingUsers, groupCreatedDate, onTimeout }: WaitingChatProps) => {
  const { t } = useTranslation();
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const secondsCreatedDate = useMemo(
    () => new Date(groupCreatedDate).getTime(),
    [groupCreatedDate]
  );
  const firedRef = useRef(false);

  // Tick logic: always update "now" every second when autoStart
  useEffect(() => {
    if (!groupCreatedDate) return;
    // initialize immediately
    setElapsedSec(Math.floor((Date.now() - secondsCreatedDate) / 1000));
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - secondsCreatedDate) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [groupCreatedDate, secondsCreatedDate]);

  const totalSec = 120; // 2 minutes
  const remainingSec = Math.max(totalSec - (elapsedSec || 0), 0);

  // Invoke the placeholder callback exactly once on timeout
  useEffect(() => {
    if (remainingSec === 0 && !firedRef.current) {
      firedRef.current = true;
      onTimeout?.();
    }
  }, [remainingSec, onTimeout]);

  const label = fromSeconds(remainingSec);
  return (
    <div className="text-start space-y-1">
      <p className="text-sm">
        {t("chat.waitingForUsers", { count: remainingUsers })}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("chat.waitingClosureWarning")}
      </p>
      <p className="text-sm font-mono tabular-nums text-muted-foreground" aria-live="polite">
        {label}
      </p>
    </div>
  )
}

export default WaitingChat 
