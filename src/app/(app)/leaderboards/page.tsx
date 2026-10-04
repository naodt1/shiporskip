import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
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
    <div className="max-w-[760px]">
      <PageHeader title="Leaderboards">Talk is cheap. These builders finished what voters picked, and these voters called it.</PageHeader>
      <div className="mb-3 flex gap-4 border-b border-border text-[14px]">
        {TABS.map((t) => {
          const on = t.key === tab.key;
          return (
            <Link
              key={t.key}
              href={t.key === "shipped" ? "/leaderboards" : `/leaderboards?tab=${t.key}`}
              className={`-mb-px border-b-2 px-1 pb-1.5 ${on ? "border-ink text-ink hover:text-ink" : "border-transparent"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      <p className="m-0 mb-3 text-[14px] text-muted-2">{tab.note}</p>
      {rows.length === 0 ? (
        <p className="wiki-box m-0 px-4 py-6 text-center text-[14px] text-muted-2">No one is on this board yet. The first to ship takes the top spot.</p>
      ) : (
        <table className="wikitable text-[14px]">
          <thead>
            <tr>
              <th className="w-12 text-right">#</th>
              <th>{tab.key === "voters" ? "Voter" : "Project"}</th>
              {tab.key !== "voters" && <th className="max-sm:hidden">Builder</th>}
              <th className="text-right">{tab.key === "shipped" ? "Time to ship" : tab.key === "projects" ? "Votes" : "Picks shipped"}</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className={`text-right ${i < 3 ? "font-bold" : "text-muted-2"}`}>{i + 1}</td>
                <td>
                  <span className={i < 3 ? "font-bold" : ""}>{r.title}</span>
                  {r.sub && <span className="text-muted-2 sm:hidden"> {r.sub}</span>}
                </td>
                {tab.key !== "voters" && <td className="text-muted-2 max-sm:hidden">{r.sub}</td>}
                <td className="text-right whitespace-nowrap">{r.stat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
