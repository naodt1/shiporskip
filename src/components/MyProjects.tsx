"use client";

import Link from "next/link";
import { useTransition } from "react";
import { boost, commit, markShipped, type ActionResult } from "@/app/actions";
import { closesLabel, pct } from "@/lib/format";
import type { MyCampaign } from "@/lib/queries";
import { useApp } from "./AppContext";
import { ShareButton } from "./ShareButton";

export function MyProjects({ campaigns, selectedId }: { campaigns: MyCampaign[]; selectedId?: string }) {
  const { openPost, toast } = useApp();
  const [busy, start] = useTransition();

  if (campaigns.length === 0)
    return (
      <div className="max-w-[680px]">
        <h1 className="m-0 mb-3 text-xl font-bold">My projects</h1>
        <p className="m-0 mb-3 text-muted-2">You haven&apos;t posted a campaign yet.</p>
        <button onClick={openPost} className="rounded-md bg-ink px-3.5 py-2 text-[15px] font-semibold text-white hover:bg-ink-hover">
          + Post projects
        </button>
      </div>
    );

  const mb = campaigns.find((c) => c.id === selectedId) ?? campaigns[0];
  const leader = mb.results[0];
  const committed = mb.results.find((r) => r.id === mb.committedProjectId);
  const headline = mb.shipped ? `Shipped ${mb.shipped}` : mb.total === 0 ? "No votes yet" : `${leader.name} leads`;

  const run = (fn: () => Promise<ActionResult & { checkoutUrl?: string }>, ok: string) =>
    start(async () => {
      const r = await fn().catch(() => ({ error: "Something went wrong", checkoutUrl: undefined }));
      if (r.error) toast(r.error);
      else if (r.checkoutUrl) window.location.href = r.checkoutUrl;
      else toast(ok);
    });

  const doBoost = () => run(() => boost(mb.id), "Boosted for 48 hours");

  return (
    <div className="max-w-[680px]">
      <h1 className="m-0 mb-3 text-xl font-bold">My projects</h1>
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {campaigns.map((c) => {
          const on = c.id === mb.id;
          return (
            <Link
              key={c.id}
              href={`/me?c=${c.id}`}
              scroll={false}
              className={`max-w-[260px] shrink-0 truncate rounded-full border px-3.5 py-1.5 text-sm no-underline ${on ? "border-ink bg-ink text-white hover:text-white" : "border-border bg-white text-ink"}`}
            >
              {c.title}
            </Link>
          );
        })}
      </div>

      <div className="rounded-[10px] border border-border bg-white p-3.5">
        <div className="mb-1 font-mono text-[13px] text-muted-2">
          {mb.total} votes · {closesLabel(mb.closesAt)}
        </div>
        <div className="mb-0.5 flex items-start justify-between gap-3">
          <h2 className="m-0 min-w-0 text-base leading-snug font-bold break-words">
            <Link href={`/c/${mb.id}`} className="no-underline">
              {mb.title}
            </Link>
          </h2>
          <ShareButton id={mb.id} />
        </div>
        <p className="m-0 mb-2.5 text-sm font-semibold text-green">{headline}</p>
        <div className="flex flex-col gap-2">
          {mb.results.map((r, i) => (
            <div key={r.id} className="relative flex items-center gap-3.5 overflow-hidden rounded-[7px] border border-border px-3 py-[7px]">
              <span className="absolute top-0 bottom-0 left-0" style={{ width: pct(r.votes, mb.total), background: i === 0 && mb.total ? "var(--color-green-tint)" : "var(--color-fill-2)" }} />
              <span className="relative min-w-0 flex-1 truncate font-semibold">{r.name}</span>
              <span className="relative font-mono text-sm">
                {pct(r.votes, mb.total)} · {r.votes}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!committed && !mb.shipped && mb.total > 0 && (
            <button
              disabled={busy}
              onClick={() => run(() => commit(mb.id, leader.id), "Committed")}
              className="rounded-md bg-green px-4 py-[9px] text-[15px] font-semibold text-white hover:bg-green-hover"
            >
              Finish {leader.name}
            </button>
          )}
          {committed && !mb.shipped && (
            <>
              <span className="text-[15px]">✓ Finishing {committed.name}</span>
              <button disabled={busy} onClick={() => run(() => markShipped(mb.id), "Shipped!")} className="p-0 text-sm text-green underline">
                Mark shipped
              </button>
            </>
          )}
          {mb.open && !mb.boosted && (
            <button disabled={busy} onClick={doBoost} className="rounded-md border border-outline bg-white px-3.5 py-2 text-[15px]">
              Boost for $9
            </button>
          )}
          {mb.open && mb.boosted && <span className="rounded bg-boost px-2 py-0.5 font-mono text-xs text-boost-text">boosted</span>}
        </div>
      </div>

      {mb.reasons.length > 0 && (
        <>
          <h3 className="mt-5 mb-2 text-[15px] font-bold">Reasons</h3>
          <div className="flex flex-col gap-1.5">
            {mb.reasons.map((c, i) => (
              <div key={i} className="rounded-[7px] border border-border bg-white px-3 py-2">
                <div className="mb-0.5 text-[13px] text-muted-2">
                  <b className="text-ink">@{c.handle}</b> → {c.project}
                </div>
                <div className="text-[15px] text-pretty">{c.text}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
