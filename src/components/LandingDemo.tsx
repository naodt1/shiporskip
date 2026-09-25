"use client";

import { useState } from "react";
import { Clock } from "./icons";

const HERO: [string, string, number][] = [
  ["tallyho", "Invoices that send themselves", 96],
  ["quietcal", "Auto-blocks focus time", 77],
  ["plotline", "Markdown in, timeline out", 41],
];

export function LandingDemo() {
  const [pick, setPick] = useState<number | null>(null);
  const voted = pick != null;
  const tot = HERO.reduce((a, r, i) => a + r[2] + (pick === i ? 1 : 0), 0);
  return (
    <div className="rounded-xl border border-border bg-white p-4.5 shadow-[0_12px_32px_rgba(26,26,26,.06)]">
      <div className="mb-2 flex items-center gap-2 text-[13px] text-muted-2">
        <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#b0561f] text-[11px] font-bold text-white">M</span>@mara
        <span className="flex items-center gap-1 rounded-full bg-fill px-2 py-px font-mono text-xs text-muted">
          <Clock size={12} />
          2d
        </span>
      </div>
      <div className="mb-3.5 text-[17px] font-bold">Three half-built things, one free weekend</div>
      <div className="flex flex-col gap-2">
        {HERO.map((r, i) => {
          const v = r[2] + (pick === i ? 1 : 0);
          const p = Math.round((v / tot) * 100) + "%";
          return (
            <button
              key={r[0]}
              onClick={() => setPick(i)}
              className={`relative flex w-full items-center gap-3 overflow-hidden rounded-lg border bg-white px-3 py-2.5 text-left hover:border-green ${pick === i ? "border-green" : "border-border"}`}
            >
              <span className="absolute top-0 bottom-0 left-0 transition-[width] duration-400" style={{ width: voted ? p : "0%", background: pick === i ? "var(--color-green-tint)" : "var(--color-fill-2)" }} />
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[7px] bg-fill font-bold text-muted-3">{r[0][0].toUpperCase()}</span>
              <span className="relative flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">{r[0]}</span>
                <span className="truncate text-[13px] text-muted-2">{r[1]}</span>
              </span>
              <span className={`relative font-mono text-sm font-semibold ${voted ? "text-ink" : "text-green"}`}>{voted ? p : "Vote"}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 font-mono text-xs text-muted-3">{voted ? "✓ voted · tap another to switch" : "Try it. Tap one."}</div>
    </div>
  );
}
