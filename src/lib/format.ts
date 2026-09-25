const AVATAR_COLORS = ["#2f5f8a", "#7a3f8f", "#b0561f", "#2f7a4a", "#9a2f3f"];

export function avatarColor(handle: string) {
  let h = 0;
  for (const c of handle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export const initial = (s: string) => (s.replace(/^@/, "")[0] || "?").toUpperCase();

export const pct = (v: number, t: number) => (t ? Math.round((v / t) * 100) : 0) + "%";

const DAY = 86_400_000;
const HOUR = 3_600_000;

/** "2d", "5h", "12m" — or null when closed. */
export function timeShort(closesAt: Date | string, now = Date.now()) {
  const ms = new Date(closesAt).getTime() - now;
  if (ms <= 0) return null;
  if (ms >= DAY) return `${Math.round(ms / DAY)}d`;
  if (ms >= HOUR) return `${Math.floor(ms / HOUR)}h`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m`;
}

export const isUrgent = (closesAt: Date | string, now = Date.now()) =>
  new Date(closesAt).getTime() - now < DAY;

export function closesLabel(closesAt: Date | string, now = Date.now()) {
  const t = timeShort(closesAt, now);
  if (t) return `${t} left`;
  return "closed " + new Date(closesAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function agoShort(d: Date | string, now = Date.now()) {
  const ms = Math.max(0, now - new Date(d).getTime());
  if (ms >= DAY) return `${Math.floor(ms / DAY)}d`;
  if (ms >= HOUR) return `${Math.floor(ms / HOUR)}h`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m`;
}
