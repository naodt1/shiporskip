/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ArrowUp, Grid } from "@/components/icons";
import { BoostedPill, TimePill } from "@/components/TimePill";
import { getUser } from "@/lib/auth";
import { getFeed, type Sort } from "@/lib/queries";

const LABELS: Record<Sort, string> = { hot: "Hot", new: "New", ending: "Ending soon" };

const DESC: Record<Sort, string> = {
  hot: "The side-project campaigns builders are voting on right now. Pick the one each maker should finish.",
  new: "The newest side-project campaigns on ShipOrSkip. Be one of the first to vote.",
  ending: "Side-project votes closing soon. Get your vote in before the builder commits.",
};

export async function generateMetadata({ searchParams }: PageProps<"/feed">): Promise<Metadata> {
  const raw = (await searchParams).sort;
  const sort: Sort = raw === "new" || raw === "ending" ? raw : "hot";
  const title = sort === "hot" ? "Vote on side projects" : `${LABELS[sort]} side-project votes`;
  const url = sort === "hot" ? "/feed" : `/feed?sort=${sort}`;
  return { title, description: DESC[sort], alternates: { canonical: url }, openGraph: { title, description: DESC[sort], url } };
}

export default async function FeedPage({ searchParams }: PageProps<"/feed">) {
  const raw = (await searchParams).sort;
  const sort: Sort = raw === "new" || raw === "ending" ? raw : "hot";
  const user = await getUser();
  const items = await getFeed(sort, user?.id ?? null);

  return (
    <>
      <h1 className="m-0 mb-3.5 text-xl leading-tight font-bold">{LABELS[sort]}</h1>
      <p className="sr-only">{DESC[sort]}</p>
      <div className="overflow-hidden rounded-[10px] border border-border bg-white">
        {items.length === 0 && <p className="m-0 px-4 py-6 text-center text-sm text-muted-2">No open campaigns yet. Be the first to post.</p>}
        {items.map((b, i) => (
          <Link
            key={b.id}
            href={`/c/${b.id}`}
            className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-white px-3.5 py-3.5 sm:gap-4 sm:px-4 text-left no-underline hover:bg-bg hover:text-ink ${i ? "border-t border-divider" : ""}`}
          >
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="flex flex-wrap items-center gap-2 text-[13px] text-muted-2">
                <Avatar handle={b.handle} url={b.avatarUrl} />
                <span>@{b.handle}</span>
                <TimePill closesAt={b.closesAt} />
                {b.boosted && <BoostedPill />}
              </span>
              <span className="text-base leading-snug font-semibold">{b.title}</span>
              <span className="flex items-center gap-4 text-[13px] text-muted-2">
                <span title="Votes" className="flex items-center gap-[5px]"><ArrowUp size={14} />{b.total}</span>
                <span title="Projects" className="flex items-center gap-[5px]"><Grid size={14} />{b.count}</span>
                {b.voted && <span className="flex items-center gap-1 font-semibold text-green">✓ voted</span>}
              </span>
            </span>
            <span className="flex items-center">
              {b.thumbs.slice(0, 3).map((t, k) =>
                t.imageUrl ? (
                  <img key={k} src={t.imageUrl} alt="" className={`h-10 w-10 rounded-lg border-2 border-white object-cover sm:h-[52px] sm:w-[52px] ${k ? "-ml-3 sm:-ml-3.5" : ""}`} />
                ) : (
                  <span key={k} className={`grid h-10 w-10 place-items-center rounded-lg border-2 border-white bg-fill text-sm font-bold text-muted-3 sm:h-[52px] sm:w-[52px] sm:text-base ${k ? "-ml-3 sm:-ml-3.5" : ""}`}>
                    {t.name[0]?.toUpperCase()}
                  </span>
                ),
              )}
              {b.thumbs.length > 3 && (
                <span className="-ml-3 grid h-10 w-10 place-items-center sm:-ml-3.5 sm:h-[52px] sm:w-[52px] rounded-lg border-2 border-white bg-border text-[13px] font-semibold text-muted">
                  +{b.thumbs.length - 3}
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
