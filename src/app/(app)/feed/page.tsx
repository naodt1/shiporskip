/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Stagger, StaggerItem } from "@/components/motion";
import { PageHeader } from "@/components/PageHeader";
import { BoostedPill, TimePill } from "@/components/TimePill";
import { getUser } from "@/lib/auth";
import { getFeed, type Sort } from "@/lib/queries";
import { tileGradient } from "@/lib/tiles";

const LABELS: Record<Sort, string> = { hot: "Hot", new: "New", ending: "Ending soon" };

const HEAD: Record<Sort, [string, string]> = {
  hot: ["Hot right now", "Builders can’t decide. You can. Pick the project each of them should ship."],
  new: ["Fresh campaigns", "Just posted. Be one of the first votes and set the tone."],
  ending: ["Closing soon", "Last call. These votes close soon, then the builder commits."],
};

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
      <PageHeader title={HEAD[sort][0]}>{HEAD[sort][1]}</PageHeader>
      {items.length === 0 ? (
        <div className="wiki-box px-4 py-6 text-center">
          <p className="m-0 mb-1 font-bold">There are no open campaigns right now.</p>
          <p className="m-0 mb-4 text-[14px] text-muted-2">Got half-built repos? Put them up and let builders pick.</p>
          <Link href="/feed?post=1" className="btn btn-primary">Post your projects</Link>
        </div>
      ) : (
        <>
          <p className="m-0 mb-2 text-[13px] text-muted-2">
            Showing {items.length} open campaign{items.length === 1 ? "" : "s"}.
          </p>
          <Stagger onMount className="flex flex-col">
            {items.map((b) => (
              <StaggerItem key={b.id} className="flex items-start gap-4 border-b border-divider py-3.5">
                <div className="min-w-0 flex-1">
                  <Link href={`/c/${b.id}`} className="text-[18px] leading-snug">
                    {b.title}
                  </Link>
                  <div className="mt-0.5 text-[14px] text-ink">
                    {b.thumbs.map((t) => t.name).join(" · ")}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-2">
                    <Avatar handle={b.handle} url={b.avatarUrl} size={14} />
                    <span>@{b.handle}</span>
                    <span>· {b.total} votes</span>
                    <span>· {b.count} projects</span>
                    <span>·</span>
                    <TimePill closesAt={b.closesAt} />
                    {b.boosted && (
                      <>
                        <span>·</span>
                        <BoostedPill />
                      </>
                    )}
                    {b.voted && <span className="font-bold text-ink">· you voted</span>}
                  </div>
                </div>
                <Link href={`/c/${b.id}`} aria-hidden tabIndex={-1} className="shrink-0">
                  {b.thumbs[0]?.imageUrl ? (
                    <img src={b.thumbs[0].imageUrl} alt="" className="h-[60px] w-[80px] border border-divider object-cover" />
                  ) : (
                    <span
                      style={{ backgroundImage: tileGradient(b.thumbs[0]?.name ?? "?") }}
                      className="grid h-[60px] w-[80px] place-items-center border border-divider font-serif text-[26px] text-muted-2"
                    >
                      {b.thumbs[0]?.name[0]?.toUpperCase()}
                    </span>
                  )}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}
    </>
  );
}
