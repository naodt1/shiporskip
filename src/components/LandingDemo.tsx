"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Clock } from "./icons";
import { EASE } from "./motion";

type Row = { name: string; desc: string; votes: number; color: string };

const START: Row[] = [
  { name: "tallyho", desc: "Invoices that send themselves", votes: 96, color: "#336021" },
  { name: "quietcal", desc: "Auto-blocks focus time", votes: 77, color: "#e68c3a" },
  { name: "plotline", desc: "Markdown in, timeline out", votes: 41, color: "#3a3737" },
];

const REASONS: [string, number, string][] = [
  ["sam", 0, "I’d pay for this today."],
  ["priya", 1, "My calendar needs this badly."],
  ["devonk", 0, "Freelancers will love it."],
  ["yuki", 2, "Niche, but I’d share it."],
  ["oskar", 1, "Ship it before Q4 planning."],
];

/** Interactive hero card: live-ticking votes, re-ranking rows, rotating voter reasons. */
export function LandingDemo() {
  const [rows, setRows] = useState(START);
  const [pick, setPick] = useState<string | null>(null);
  const [bump, setBump] = useState<{ name: string; k: number } | null>(null);
  const [reason, setReason] = useState(0);

  // Simulated live votes, weighted toward the leader so the race looks real.
  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.random();
      const i = r < 0.45 ? 0 : r < 0.8 ? 1 : 2;
      const name = START[i].name;
      setRows((rs) => rs.map((x) => (x.name === name ? { ...x, votes: x.votes + 1 } : x)));
      setBump((b) => ({ name, k: (b?.k ?? 0) + 1 }));
    }, 1700);
    const u = setInterval(() => setReason((n) => (n + 1) % REASONS.length), 3200);
    return () => {
      clearInterval(t);
      clearInterval(u);
    };
  }, []);

  const vote = (name: string) => {
    if (pick === name) return;
    setRows((rs) => rs.map((x) => ({ ...x, votes: x.votes + (x.name === name ? 1 : 0) - (x.name === pick ? 1 : 0) })));
    setPick(name);
    setBump((b) => ({ name, k: (b?.k ?? 0) + 1 }));
  };

  const total = rows.reduce((a, r) => a + r.votes, 0);
  const sorted = [...rows].sort((a, b) => b.votes - a.votes);
  const [who, idx, text] = REASONS[reason];

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[480px]"
      initial={{ opacity: 0, y: 24, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
    >
      {/* Stacked cards behind, for depth. */}
      <div aria-hidden className="absolute inset-x-6 -bottom-3 h-full rounded-2xl border border-border bg-white/70 shadow-sm" />
      <div aria-hidden className="absolute inset-x-12 -bottom-6 h-full rounded-2xl border border-border bg-white/40" />

      <div className="relative rounded-2xl border border-border bg-white p-4.5 shadow-[0_1px_2px_rgba(39,37,37,.04),0_24px_48px_-12px_rgba(39,37,37,.14)] sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-[13px] text-muted-2">
          <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#b4532a] text-[11px] font-bold text-white">M</span>@mara
          <span className="flex items-center gap-1 rounded-full bg-fill px-2 py-px font-mono text-xs text-muted">
            <Clock size={12} />
            2d
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[.06em] text-green uppercase">
            <span className="live-dot" /> Live
          </span>
        </div>
        <div className="mb-3.5 text-[17px] font-bold tracking-[-.01em]">Three half-built things, one free weekend</div>

        <div className="flex flex-col gap-2">
          {sorted.map((r) => {
            const p = Math.round((r.votes / total) * 100);
            const mine = pick === r.name;
            const lead = sorted[0].name === r.name;
            return (
              <motion.button
                key={r.name}
                layout
                transition={{ layout: { type: "spring", stiffness: 500, damping: 40 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => vote(r.name)}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-xl border bg-white px-3 py-2.5 text-left transition-colors hover:border-green ${mine ? "border-green" : "border-border"}`}
              >
                <motion.span
                  className="absolute inset-y-0 left-0"
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  style={{ background: mine ? "var(--color-green-tint)" : lead ? "var(--color-fill-3)" : "var(--color-fill-2)" }}
                />
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg font-bold text-white" style={{ background: r.color }}>
                  {r.name[0].toUpperCase()}
                </span>
                <span className="relative flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {r.name}
                    {mine && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 15 }} className="text-xs text-green">
                        ✓
                      </motion.span>
                    )}
                  </span>
                  <span className="truncate text-[13px] text-muted-2">{r.desc}</span>
                </span>
                <span className="relative flex items-center font-mono text-sm font-semibold tabular-nums">
                  <AnimatePresence>
                    {bump?.name === r.name && (
                      <motion.span
                        key={bump.k}
                        className="absolute -top-1 right-0 text-xs font-bold text-orange-text"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: [0, 1, 0], y: -14 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      >
                        +1
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {p}%
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-3 h-[52px] overflow-hidden rounded-xl bg-fill-2 px-3 py-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={reason} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE }}>
              <div className="font-mono text-[11px] text-muted-3">
                @{who} voted <b className="text-ink">{START[idx].name}</b>
              </div>
              <div className="truncate text-[14px]">“{text}”</div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-2.5 font-mono text-xs text-muted-3">{pick ? "✓ your pick · tap another to switch" : "Try it. Tap the one you’d ship."}</div>
      </div>

      {/* Floating proof chip */}
      <motion.div
        aria-hidden
        className="absolute -top-4 -right-2 rounded-full bg-orange px-3 py-1.5 font-mono text-xs font-bold text-ink shadow-[0_8px_24px_-8px_rgba(230,140,58,.7)] sm:-right-5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 1 }, scale: { delay: 1, type: "spring" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.4 } }}
      >
        ⏱ verdict in 3 days
      </motion.div>
    </motion.div>
  );
}
