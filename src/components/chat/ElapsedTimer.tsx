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
  const [now, setNow] = useState(() => Date.now());
  const startMs = useMemo(() => {
    if (start instanceof Date) return start.getTime();
    if (typeof start === "number") return start;
    if (start && typeof (start as any).seconds === "number")
      return (start as any).seconds * 1000;
    return Date.now();
  }, [start]);
  const lastIndexRef = useRef<number>(-1);
  const completedRef = useRef<boolean>(false);

  // nothing to reset: derived from start + now

  // Tick logic: always update "now" every second when autoStart
  useEffect(() => {
    if (!autoStart) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [autoStart]);

  // Compute remaining based on start + elapsed across segments if timers provided
  const elapsedSecs = Math.max(0, Math.floor((now - startMs) / 1000));
  // total plan could be used for progress; computed on the fly when needed

  let activeIndex = -1;
  let remaining = 0;
  if (normalized.length > 0) {
    let acc = 0;
    for (let i = 0; i < normalized.length; i++) {
      const seg = normalized[i] ?? 0;
      if (elapsedSecs < acc + seg) {
        activeIndex = i;
        remaining = acc + seg - elapsedSecs;
        break;
      }
      acc += seg;
    }
    if (activeIndex === -1) {
      // plan finished
      remaining = 0;
      if (!completedRef.current) {
        onComplete?.();
        completedRef.current = true;
      }
    } else {
      // segment changed detection
      if (lastIndexRef.current !== activeIndex) {
        lastIndexRef.current = activeIndex;
        completedRef.current = false;
        onSegmentChange?.(activeIndex);
      }
    }
  }

  useEffect(() => {
    if (completedRef.current) {
      completedRef.current = false;
      onComplete?.()
    }
  }, [start]);

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
    const total = elapsedSecs;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    label = `${withHours || h > 0 ? pad(h) + ":" : ""}${pad(m)}:${pad(s)}`;
  }

  return <div className={className}>{label}</div>;
}
