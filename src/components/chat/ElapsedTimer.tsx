import { useEffect, useMemo, useRef, useState } from "react";

type ElapsedTimerProps = {
  timers?: number[]; // list of durations in seconds
  start?: Date | { seconds: number } | number; // backward-compatible elapsed mode
  className?: string;
  withHours?: boolean; // force show hours
  autoStart?: boolean;
  onSegmentChange?: (index: number) => void; // called when moving to next timer
  onComplete?: () => void; // called after last segment completes
};

export function ElapsedTimer({
  timers,
  start,
  className,
  withHours = false,
  autoStart = true,
  onSegmentChange,
  onComplete,
}: ElapsedTimerProps) {
  const normalized = useMemo(
    () => (Array.isArray(timers) ? timers.filter((n) => n > 0) : []),
    [timers]
  );
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState<number>(normalized[0] ?? 0);
  const intervalRef = useRef<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const startMs = useMemo(() => {
    if (start instanceof Date) return start.getTime();
    if (typeof start === "number") return start;
    if (start && typeof (start as any).seconds === "number")
      return (start as any).seconds * 1000;
    return Date.now();
  }, [start]);

  // Reset when timers change
  useEffect(() => {
    setIndex(0);
    setRemaining(normalized[0] ?? 0);
  }, [normalized]);

  // Tick logic: if timers provided => countdown; else => elapsed since start
  useEffect(() => {
    if (normalized.length > 0) {
      if (!autoStart) return;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev > 1) return prev - 1;
          // segment finished
          if (index < normalized.length - 1) {
            const nextIndex = index + 1;
            setIndex(nextIndex);
            onSegmentChange?.(nextIndex);
            return normalized[nextIndex] ?? 0;
          } else {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            intervalRef.current = null;
            onComplete?.();
            return 0;
          }
        });
      }, 1000);
      return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      };
    } else {
      // elapsed mode
      const id = window.setInterval(() => setNow(Date.now()), 1000);
      return () => window.clearInterval(id);
    }
  }, [autoStart, index, normalized, onComplete, onSegmentChange, startMs]);

  // Format label
  const pad = (n: number) => String(n).padStart(2, "0");
  let label = "";
  if (normalized.length > 0) {
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    label = `${withHours || hours > 0 ? pad(hours) + ":" : ""}${pad(
      minutes
    )}:${pad(seconds)}`;
  } else {
    const diff = Math.max(0, now - startMs);
    const total = Math.floor(diff / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    label = `${withHours || h > 0 ? pad(h) + ":" : ""}${pad(m)}:${pad(s)}`;
  }

  return <div className={className}>{label}</div>;
}
