/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { sendReason, vote } from "@/app/actions";
import { closesLabel, pct } from "@/lib/format";
import { tileGradient } from "@/lib/tiles";
import type { CampaignDetail } from "@/lib/queries";
import { useApp } from "./AppContext";
import { EASE } from "./motion";
import { ShareButton } from "./ShareButton";

export function CampaignView({ c, focusId }: { c: CampaignDetail; focusId?: string }) {
  const { gate, toast } = useApp();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [sentLocal, setSentLocal] = useState(false);
  const [popped, setPopped] = useState<string | null>(null); // project just voted for, drives the "+1"
  const sent = sentLocal || c.reasonSent;
  const [, start] = useTransition();
  const focusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

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
    setPopped(pid);
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
        <span className="font-mono text-xs text-muted-2">
          <span className="font-bold tracking-[.06em] text-green uppercase">Ship or skip?</span> · @{c.handle} · {c.projects.length} projects{c.own ? " · yours" : ""}
        </span>
        <span className="font-mono text-xs text-muted-3">
          {total} votes · {closesLabel(c.closesAt)}
        </span>
      </div>
      <div className="mt-0.5 mb-4 flex items-start justify-between gap-3">
        <h1 className="m-0 min-w-0 text-2xl leading-tight font-bold tracking-[-.025em] break-words">{c.title}</h1>
        <ShareButton path={`/c/${c.id}`} title={c.title} />
      </div>

      <motion.div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
        {c.projects.map((p) => {
          const v = counts[p.id];
          const isMine = mine === p.id;
          const fill = isMine ? "var(--color-green-tint)" : v === max ? "var(--color-fill-3)" : "var(--color-fill-2)";
          const label = isMine ? "Your pick" : c.own || !c.open ? `${v} votes` : "Switch";
          return (
            <motion.div
              key={p.id}
              id={`p-${p.id}`}
              ref={p.id === focusId ? focusRef : undefined}
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
              animate={popped === p.id ? { scale: [1, 1.025, 1] } : undefined}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className={`flex scroll-mt-4 flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(26,26,26,.25)] ${isMine ? "border-green shadow-[0_0_0_3px_var(--color-green-tint-2)]" : "border-border"} ${p.id === focusId ? "ring-2 ring-green/70 ring-offset-2 ring-offset-bg" : ""}`}
            >
              {p.imageUrl ? (
                <img src={p.imageUrl} alt="" className="block aspect-[16/9] w-full object-cover sm:aspect-[4/3]" />
              ) : (
                <span style={{ backgroundImage: tileGradient(p.name) }} className="grid aspect-[16/9] w-full place-items-center text-[44px] font-bold tracking-[-.04em] text-white/90 sm:aspect-[4/3]">{p.name[0]?.toUpperCase()}</span>
              )}
              <div className="flex flex-1 flex-col gap-1 p-3">
                <span className="flex items-start justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate font-semibold">{p.name}</span>
                    {isMine && <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 600, damping: 14 }} className="text-xs font-semibold text-green">✓</motion.span>}
                  </span>
                  <ShareButton compact path={`/c/${c.id}/p/${p.id}`} title={`Vote for ${p.name}`} label={`Share ${p.name}`} />
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
                      className="press w-full rounded-lg border border-green bg-white p-2 text-sm font-semibold text-green hover:bg-green hover:text-white"
                    >
                      Ship this one
                    </button>
                  ) : (
                    <button
                      onClick={() => doVote(p.id)}
                      aria-label={`${p.name}: ${label}, ${pct(v, total)}`}
                      disabled={!c.own && (!c.open || isMine)}
                      className="relative flex w-full justify-between overflow-hidden rounded-lg border border-border bg-white px-2.5 py-2 text-sm disabled:cursor-default"
                    >
                      <motion.span className="absolute top-0 bottom-0 left-0" initial={{ width: 0 }} animate={{ width: pct(v, total) }} transition={{ type: "spring", stiffness: 110, damping: 20 }} style={{ background: fill }} />
                      <span className="relative text-muted-2">{label}</span>
                      <span className="relative font-mono font-semibold tabular-nums">
                        <AnimatePresence>
                          {popped === p.id && isMine && (
                            <motion.span key="plus" className="absolute -top-2 right-0 text-xs text-green" initial={{ opacity: 0, y: 4 }} animate={{ opacity: [0, 1, 0], y: -16 }} transition={{ duration: 1, ease: "easeOut" }}>
                              +1
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {pct(v, total)}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {c.open && !c.own && mine && !sent && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="mt-4 flex max-w-[520px] gap-1.5">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitReason()}
            placeholder={`Why should they ship ${mineName}?`}
            maxLength={280}
            className="min-w-0 flex-1 rounded-md border border-border bg-white px-2.5 py-2 text-sm"
          />
          <button onClick={submitReason} className="press rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-white hover:bg-ink-hover">
            Send
          </button>
        </motion.div>
      )}
      {mine && sent && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3.5 text-[13px] font-semibold text-green">✓ Reason sent. The builder will see it.</motion.div>}
    </>
  );
}
