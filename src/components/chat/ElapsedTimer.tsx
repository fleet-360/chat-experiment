import { useEffect, useMemo, useState } from "react";

export function ElapsedTimer({
  start,
  className,
  withHours = false,
}: {
  start: Date | { seconds: number } | number;
  className?: string;
  withHours?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());

  const startMs = useMemo(() => {
    if (start instanceof Date) return start.getTime();
    if (typeof start === "number") return start;
    if (start && typeof (start as any).seconds === "number")
      return (start as any).seconds * 1000;
    return Date.now();
  }, [start]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, now - startMs);
  const total = Math.floor(diff / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const label = `${withHours ? pad(h) + ":" : ""}${pad(m)}:${pad(s)}`;

  return <div className={className}>{label}</div>;
}
