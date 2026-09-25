import Link from "next/link";
import { getBoard, type Board } from "@/lib/queries";

export const metadata = {
  title: "Leaderboards",
  description: "Fastest builders to ship what voters picked, the most-wanted unfinished projects, and voters with the best track record.",
  alternates: { canonical: "/leaderboards" },
};

const TABS: { key: Board; label: string; note: string }[] = [
  { key: "shipped", label: "Shipped", note: "Builders who finished the project voters picked, fastest first." },
  { key: "projects", label: "Most wanted", note: "Unfinished projects with the most votes this week." },
  { key: "voters", label: "Top voters", note: "Voters whose pick went on to ship." },
];

export default async function LeaderboardsPage({ searchParams }: PageProps<"/leaderboards">) {
  const raw = (await searchParams).tab;
  const tab = TABS.find((t) => t.key === raw) ?? TABS[0];
  const rows = await getBoard(tab.key);

  return (
    <div className="max-w-[680px]">
      <h1 className="m-0 mb-1 text-xl font-bold">Leaderboards</h1>
      <div className="mt-2.5 mb-3 flex w-max max-w-full flex-wrap gap-1 rounded-lg bg-fill p-1">
        {TABS.map((t) => {
          const on = t.key === tab.key;
          return (
            <Link
              key={t.key}
              href={t.key === "shipped" ? "/leaderboards" : `/leaderboards?tab=${t.key}`}
              className={`rounded-md px-3.5 py-1.5 text-[15px] no-underline hover:text-ink ${on ? "bg-white font-semibold shadow-[0_1px_2px_rgba(0,0,0,.08)]" : ""}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <p className="m-0 mb-3 text-sm text-muted-3">{tab.note}</p>
      <div className="rounded-[10px] border border-border bg-white">
        {rows.length === 0 && <p className="m-0 px-3.5 py-5 text-center text-sm text-muted-2">Nothing here yet.</p>}
        {rows.map((r, i) => (
          <div key={i} className={`grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-2 ${i ? "border-t border-divider" : ""}`}>
            <span className={`font-mono text-sm font-bold ${i < 3 ? "text-green" : "text-muted-3"}`}>{i + 1}</span>
            <span className="flex min-w-0 flex-wrap items-baseline gap-2">
              <span className="font-semibold">{r.title}</span>
              {r.sub && <span className="text-sm text-muted-3">{r.sub}</span>}
            </span>
            <span className="font-mono text-sm whitespace-nowrap">{r.stat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
