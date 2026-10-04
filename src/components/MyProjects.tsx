"use client";

import Link from "next/link";
import { useTransition } from "react";
import { boost, commit, markShipped, type ActionResult } from "@/app/actions";
import { closesLabel, pct } from "@/lib/format";
import type { MyCampaign } from "@/lib/queries";
import { useApp } from "./AppContext";
import { ShareButton } from "./ShareButton";
import { MAX_PROJECTS, MIN_PROJECTS } from "@/lib/config";
import { PageHeader } from "./PageHeader";

export function MyProjects({ campaigns, selectedId }: { campaigns: MyCampaign[]; selectedId?: string }) {
  const { openPost, toast } = useApp();
  const [busy, start] = useTransition();

  if (campaigns.length === 0)
    return (
      <div className="max-w-[680px]">
        <PageHeader title="Nothing up for a vote yet">
          Line up {MIN_PROJECTS}–{MAX_PROJECTS} half-built repos and let builders tell you which one to ship.
        </PageHeader>
        <button onClick={openPost} className="btn btn-primary">
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
      <PageHeader title="Your campaigns" />
      <div className="no-scrollbar -mx-4 mb-5 flex gap-4 overflow-x-auto border-b border-border px-4 text-[14px] sm:mx-0 sm:px-0">
        {campaigns.map((c) => {
          const on = c.id === mb.id;
          return (
            <Link
              key={c.id}
              href={`/me?c=${c.id}`}
              scroll={false}
              className={`-mb-px max-w-[260px] shrink-0 truncate border-b-2 px-1 pb-1.5 ${on ? "border-ink text-ink hover:text-ink" : "border-transparent"}`}
            >
              {c.title}
            </Link>
          );
        })}
      </div>

      <div className="wiki-box bg-white p-4">
        <div className="mb-1 text-[13px] text-muted-2">
          {mb.total} votes · {closesLabel(mb.closesAt)}
        </div>
        <div className="mb-0.5 flex items-start justify-between gap-3">
          <h2 className="m-0 min-w-0 text-[22px] leading-snug break-words">
            <Link href={`/c/${mb.id}`}>
              {mb.title}
            </Link>
          </h2>
          <ShareButton path={`/c/${mb.id}`} title={mb.title} />
        </div>
        <p className="m-0 mb-2.5 text-[14px] font-bold">{headline}</p>
        <div className="flex flex-col gap-2">
          {mb.results.map((r, i) => (
            <div key={r.id} className="relative flex items-center gap-3.5 overflow-hidden border border-border bg-white px-3 py-1.5">
              <span className="absolute top-0 bottom-0 left-0" style={{ width: pct(r.votes, mb.total), background: i === 0 && mb.total ? "var(--color-primary-tint)" : "var(--color-fill-2)" }} />
              <span className="relative min-w-0 flex-1 truncate">{r.name}</span>
              <span className="relative text-sm">
                {pct(r.votes, mb.total)} · {r.votes}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!committed && !mb.shipped && mb.total > 0 && (
            <button
              disabled={busy}
              onClick={() => run(() => commit(mb.id, leader.id), `Committed. Go ship ${leader.name}.`)}
              className="btn btn-primary"
            >
              Finish {leader.name}
            </button>
          )}
          {committed && !mb.shipped && (
            <>
              <span className="text-[15px]">✓ Finishing {committed.name}</span>
              <button disabled={busy} onClick={() => run(() => markShipped(mb.id), "Shipped. That’s how it’s done.")} className="p-0 text-[14px] text-primary hover:underline">
                Mark shipped
              </button>
            </>
          )}
          {mb.open && !mb.boosted && (
            <button disabled={busy} onClick={doBoost} className="btn btn-normal">
              Boost for $9
            </button>
          )}
          {mb.open && mb.boosted && <span className="bg-boost px-1.5 text-[13px] text-boost-text">boosted</span>}
        </div>
      </div>

      {mb.reasons.length > 0 && (
        <>
          <h2 className="wiki-rule mt-7 mb-3 text-[24px]">Why they voted</h2>
          <div className="flex flex-col gap-2">
            {mb.reasons.map((c, i) => (
              <div key={i} className="border-l-4 border-divider py-0.5 pl-3">
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
