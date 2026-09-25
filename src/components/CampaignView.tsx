/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { sendReason, vote } from "@/app/actions";
import { closesLabel, pct } from "@/lib/format";
import type { CampaignDetail } from "@/lib/queries";
import { useApp } from "./AppContext";
import { ShareButton } from "./ShareButton";

export function CampaignView({ c }: { c: CampaignDetail }) {
  const { gate, toast } = useApp();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [sentLocal, setSentLocal] = useState(false);
  const sent = sentLocal || c.reasonSent;
  const [, start] = useTransition();

  // Optimistic vote; falls back to server data when the action settles.
  const server = { mine: c.myProjectId, counts: Object.fromEntries(c.projects.map((p) => [p.id, p.votes])) };
  const [{ mine, counts }, applyVote] = useOptimistic(server, (s, pid: string) => ({
    mine: pid,
    counts: { ...s.counts, [pid]: s.counts[pid] + 1, ...(s.mine ? { [s.mine]: s.counts[s.mine] - 1 } : {}) },
  }));

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(counts));
  const voted = c.own || mine != null || !c.open;

  const doVote = (pid: string) => {
    if (c.own) return router.push(`/me?c=${c.id}`);
    if (!c.open || pid === mine) return;
    start(async () => {
      applyVote(pid);
      const r = await vote(c.id, pid).catch(() => ({ error: "Vote failed. Try again." }));
      if (r.error) toast(r.error);
    });
  };

  const submitReason = async () => {
    if (!note.trim() || !mine) return;
    setSentLocal(true);
    const r = await sendReason(c.id, note).catch(() => ({ error: "Couldn't send. Try again." }));
    if (r.error) {
      setSentLocal(false);
      toast(r.error);
    }
  };

  const mineName = c.projects.find((p) => p.id === mine)?.name;

  return (
    <>
      <Link href="/feed" className="mb-3 inline-block text-sm text-muted-2 no-underline hover:text-ink">
        ← Back
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-mono text-xs text-muted-2">@{c.handle} · {c.projects.length} projects{c.own ? " · yours" : ""}</span>
        <span className="font-mono text-xs text-muted-3">
          {total} votes · {closesLabel(c.closesAt)}
        </span>
      </div>
      <div className="mt-0.5 mb-4 flex items-start justify-between gap-3">
        <h1 className="m-0 min-w-0 text-xl leading-snug font-bold break-words">{c.title}</h1>
        <ShareButton id={c.id} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3.5">
        {c.projects.map((p) => {
          const v = counts[p.id];
          const isMine = mine === p.id;
          const fill = isMine ? "var(--color-green-tint)" : v === max ? "var(--color-fill-3)" : "var(--color-fill-2)";
          const label = isMine ? "Your vote" : c.own || !c.open ? `${v} votes` : "Switch";
          return (
            <div key={p.id} className={`flex flex-col overflow-hidden rounded-[10px] border bg-white ${isMine ? "border-green" : "border-border"}`}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt="" className="block aspect-[16/9] w-full object-cover sm:aspect-[4/3]" />
              ) : (
                <span className="grid aspect-[16/9] w-full place-items-center bg-fill text-[28px] font-bold text-faint sm:aspect-[4/3]">{p.name[0]?.toUpperCase()}</span>
              )}
              <div className="flex flex-1 flex-col gap-1 p-3">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold">{p.name}</span>
                  {isMine && <span className="text-xs font-semibold text-green">✓</span>}
                </span>
                <span className="text-sm text-pretty text-muted-2">{p.oneliner}</span>
                <a href={`https://github.com/${p.repoFullName}`} target="_blank" rel="noopener" className="font-mono text-xs text-muted-3 no-underline hover:text-green">
                  github.com/{p.repoFullName} · {p.commits} commits
                </a>
                {p.offer && (
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded bg-green-tint-2 px-1.5 py-px font-semibold text-green-text">{p.offer}</span>
                    {p.hasCode &&
                      (p.promoCode ? <span className="font-mono font-bold text-ink">{p.promoCode}</span> : <span className="font-mono text-muted-3">vote for code</span>)}
                  </span>
                )}
                {!p.offer && p.hasCode && (
                  <span className="mt-0.5 font-mono text-xs">
                    {p.promoCode ? <span className="font-bold">{p.promoCode}</span> : <span className="text-muted-3">vote for code</span>}
                  </span>
                )}
                <div className="mt-auto pt-2.5">
                  {!voted ? (
                    <button
                      onClick={() => gate(() => doVote(p.id), "Log in to vote.")}
                      aria-label={`Vote for ${p.name}`}
                      className="w-full rounded-md border border-green bg-white p-2 text-sm font-semibold text-green hover:bg-green hover:text-white"
                    >
                      Vote
                    </button>
                  ) : (
                    <button
                      onClick={() => doVote(p.id)}
                      aria-label={`${p.name}: ${label}, ${pct(v, total)}`}
                      disabled={!c.own && (!c.open || isMine)}
                      className="relative flex w-full justify-between overflow-hidden rounded-md border border-border bg-white px-2.5 py-2 text-sm disabled:cursor-default"
                    >
                      <span className="absolute top-0 bottom-0 left-0 transition-[width] duration-400" style={{ width: pct(v, total), background: fill }} />
                      <span className="relative text-muted-2">{label}</span>
                      <span className="relative font-mono font-semibold">{pct(v, total)}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {c.open && !c.own && mine && !sent && (
        <div className="mt-3.5 flex max-w-[520px] gap-1.5">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitReason()}
            placeholder={`Why ${mineName}?`}
            maxLength={280}
            className="min-w-0 flex-1 rounded-md border border-border bg-white px-2.5 py-2 text-sm"
          />
          <button onClick={submitReason} className="rounded-md bg-ink px-3.5 py-2 text-sm font-semibold text-white hover:bg-ink-hover">
            Send
          </button>
        </div>
      )}
      {mine && sent && <div className="mt-3.5 text-[13px] text-green">Sent</div>}
    </>
  );
}
