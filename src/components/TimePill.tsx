import { isUrgent, timeShort } from "@/lib/format";
import { Clock } from "./icons";

export function TimePill({ closesAt }: { closesAt: string }) {
  const t = timeShort(closesAt) ?? "closed";
  const urgent = isUrgent(closesAt);
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-px font-mono text-xs ${urgent ? "bg-urgent-bg text-urgent" : "bg-fill text-muted"}`}>
      <Clock size={12} />
      {t}
    </span>
  );
}

export const BoostedPill = () => <span className="rounded-full bg-boost px-2 py-px font-mono text-xs text-boost-text">boosted</span>;
