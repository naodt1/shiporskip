"use client";

import { motion } from "motion/react";
import { useState } from "react";

const START = [
  { name: "tallyho", desc: "Invoices that send themselves", votes: 96 },
  { name: "quietcal", desc: "Auto-blocks focus time", votes: 77 },
  { name: "plotline", desc: "Markdown in, timeline out", votes: 41 },
];

/** Example campaign shown when nothing is open yet: tap a row to vote. */
export function LandingDemo() {
  const [pick, setPick] = useState<string | null>(null);
  const rows = START.map((r) => ({ ...r, votes: r.votes + (pick === r.name ? 1 : 0) }));
  const total = rows.reduce((a, r) => a + r.votes, 0);
  return (
    <div className="border border-border bg-white">
      <div className="border-b border-border bg-fill-2 px-3 py-2">
        <div className="text-[13px] text-muted-2">Example · @mara · 2 days left</div>
        <div className="font-serif text-[19px]">Three half-built things, one free weekend</div>
      </div>
      <div className="flex flex-col">
        {rows.map((r, i) => {
          const p = Math.round((r.votes / total) * 100);
          const mine = pick === r.name;
          return (
            <button
              key={r.name}
              onClick={() => setPick(r.name)}
              className={`relative flex w-full items-center gap-3 overflow-hidden px-3 py-2.5 text-left hover:bg-fill-2 ${i ? "border-t border-divider" : ""}`}
            >
              {pick && (
                <motion.span
                  className="absolute inset-y-0 left-0 bg-primary-tint-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              )}
              <span className="relative flex min-w-0 flex-1 flex-col">
                <span className={`text-primary ${mine ? "font-bold" : ""}`}>
                  {r.name}
                  {mine && " ✓"}
                </span>
                <span className="truncate text-[13px] text-muted-2">{r.desc}</span>
              </span>
              <span className="relative text-sm">{pick ? `${p}%` : <span className="text-primary">Vote</span>}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
