export const toSeconds = (mmss: string): number => {
  const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(mmss || "");
  if (!m) return 0;
  const minutes = parseInt(m[1]!, 10);
  const seconds = parseInt(m[2]!, 10);
  return minutes * 60 + seconds;
};

export const fromSeconds = (secs: number): string => {
  if (!secs || secs < 0) secs = 0;
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export const toDate = (v: any): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object" && typeof v.seconds === "number")
    return new Date(v.seconds * 1000);
  if (typeof v === "number") return new Date(v);
  return null;
};
