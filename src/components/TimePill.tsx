import { isUrgent, timeShort } from "@/lib/format";

/** Time left as plain text; red when the vote is about to close. */
export function TimePill({ closesAt }: { closesAt: string }) {
  const t = timeShort(closesAt);
  return <span className={isUrgent(closesAt) ? "font-bold text-urgent" : ""}>{t ? `${t} left` : "closed"}</span>;
}

export const BoostedPill = () => <span className="bg-boost px-1 text-boost-text">boosted</span>;
