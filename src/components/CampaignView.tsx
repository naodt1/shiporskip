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
      <div className="mb-5">
        <div className="flex items-end justify-between gap-3 border-b border-border pb-1">
          <h1 className="m-0 min-w-0 text-[28.8px] leading-[1.3] break-words">{c.title}</h1>
          <div className="shrink-0 pb-1">
            <ShareButton path={`/c/${c.id}`} title={c.title} />
          </div>
        </div>
        <div className="mt-1 text-[13px] text-muted-2">
          A campaign by @{c.handle} · {c.projects.length} projects · {total} votes · {closesLabel(c.closesAt)}
          {c.own && " · this is your campaign"}
        </div>
        <p className="m-0 mt-3 max-w-[720px] text-[15px]">
          <b>@{c.handle}</b> can’t decide which of these {c.projects.length} side projects to finish.{" "}
          {c.open ? (c.own ? "Share the link to get votes." : "Vote for the one you’d ship, and say why.") : "Voting has closed."}{" "}
          <Link href="/feed">Back to all campaigns</Link>.
        </p>
      </div>

      <motion.div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] gap-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
        {c.projects.map((p) => {
          const v = counts[p.id];
          const isMine = mine === p.id;
          const fill = isMine ? "var(--color-primary-tint)" : v === max ? "var(--color-fill)" : "var(--color-fill-2)";
          const label = isMine ? "Your vote" : c.own || !c.open ? `${v} votes` : "Switch to this";
          return (
            <motion.div
              key={p.id}
              id={`p-${p.id}`}
              ref={p.id === focusId ? focusRef : undefined}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
              className={`flex scroll-mt-4 flex-col border bg-fill-2 ${isMine ? "border-primary outline outline-1 outline-primary" : "border-border"} ${p.id === focusId ? "outline-2 outline-offset-2 outline-primary" : ""}`}
            >
              <div className="border-b border-border bg-fill px-3 py-1.5 text-center font-serif text-[18px] font-bold">
                {p.name}
                {isMine && <span className="ml-1.5 font-sans text-[13px] font-normal text-primary">✓ your vote</span>}
              </div>
              <div className="bg-white p-1.5">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={`Screenshot of ${p.name}`} className="block aspect-[4/3] w-full border border-divider object-cover" />
                ) : (
                  <span style={{ backgroundImage: tileGradient(p.name) }} className="grid aspect-[4/3] w-full place-items-center border border-divider font-serif text-[48px] text-muted-2">
                    {p.name[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 bg-white px-3 pb-3 text-[14px]">
                <p className="m-0 text-pretty">{p.oneliner}</p>
                <table className="w-full text-[13px]">
                  <tbody>
                    <tr>
                      <th className="w-[72px] py-0.5 pr-2 text-left align-top font-bold">Repo</th>
                      <td className="py-0.5 break-all">
                        <a href={`https://github.com/${p.repoFullName}`} target="_blank" rel="noopener">{p.repoFullName}</a>
                      </td>
                    </tr>
                    <tr>
                      <th className="py-0.5 pr-2 text-left font-bold">Commits</th>
                      <td className="py-0.5">{p.commits}</td>
                    </tr>
                    {(p.offer || p.hasCode) && (
                      <tr>
                        <th className="py-0.5 pr-2 text-left align-top font-bold">Offer</th>
                        <td className="py-0.5">
                          {p.offer}
                          {p.hasCode && (p.promoCode ? <> · code <b className="font-mono">{p.promoCode}</b></> : <span className="text-muted-2"> · vote to see the code</span>)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <ShareButton compact path={`/c/${c.id}/p/${p.id}`} title={`Vote for ${p.name}`} label={`Share ${p.name}`} />
                </div>
                {!voted ? (
                  <button onClick={() => gate(() => doVote(p.id), "Log in to vote.")} aria-label={`Vote for ${p.name}`} className="btn btn-primary w-full">
                    Vote to ship {p.name}
                  </button>
                ) : (
                  <button
                    onClick={() => doVote(p.id)}
                    aria-label={`${p.name}: ${label}, ${pct(v, total)}`}
                    disabled={!c.own && (!c.open || isMine)}
                    className="relative flex w-full justify-between overflow-hidden border border-border bg-white px-2.5 py-1.5 text-[14px] disabled:cursor-default"
                  >
                    <motion.span className="absolute top-0 bottom-0 left-0" initial={{ width: 0 }} animate={{ width: pct(v, total) }} transition={{ type: "spring", stiffness: 110, damping: 20 }} style={{ background: fill }} />
                    <span className={`relative ${isMine ? "font-bold" : "text-muted-2"}`}>{label}</span>
                    <span className="relative font-bold tabular-nums">
                      <AnimatePresence>
                        {popped === p.id && isMine && (
                          <motion.span key="plus" className="absolute -top-2 right-0 text-xs text-primary" initial={{ opacity: 0, y: 4 }} animate={{ opacity: [0, 1, 0], y: -16 }} transition={{ duration: 1, ease: "easeOut" }}>
                            +1
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {pct(v, total)}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {c.open && !c.own && mine && !sent && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="mt-5 max-w-[560px]">
          <label htmlFor="reason" className="mb-1 block text-[14px] font-bold">
            Why should they ship {mineName}?
          </label>
          <div className="flex gap-1.5">
            <input
              id="reason"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReason()}
              placeholder="One line is plenty"
              maxLength={280}
              className="min-w-0 flex-1 border border-border bg-white px-2.5 py-1.5 text-[14px] focus:border-primary focus:outline-none"
            />
            <button onClick={submitReason} className="btn btn-primary">
              Send
            </button>
          </div>
        </motion.div>
      )}
      {mine && sent && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 mb-0 text-[14px]">
          ✓ Reason sent. The builder will see it.
        </motion.p>
      )}
    </>
  );
}
