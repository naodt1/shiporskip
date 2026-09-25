"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppContext";
import { LinkIcon } from "./icons";

/** Copies a share link (or opens the native share sheet on touch devices). */
export function ShareButton({ path, title, compact, label }: { path: string; title?: string; compact?: boolean; label?: string }) {
  const { toast } = useApp();
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  const share = async () => {
    const url = window.location.origin + path;
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ url, title });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    const done = () => {
      setCopied(true);
      toast("Link copied");
      clearTimeout(t.current);
      t.current = setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, done);
    else done();
  };

  if (compact)
    return (
      <button
        onClick={share}
        aria-label={label ?? "Share"}
        title={copied ? "Copied" : (label ?? "Share")}
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border bg-white hover:border-green hover:text-green ${copied ? "border-green text-green" : "border-outline text-muted-2"}`}
      >
        <LinkIcon size={14} />
      </button>
    );

  return (
    <button
      onClick={share}
      className="flex shrink-0 items-center gap-1.5 rounded-md border border-outline bg-white px-3 py-1.5 text-sm font-semibold hover:border-green hover:text-green"
    >
      <LinkIcon size={14} />
      {copied ? "Copied" : "Share"}
    </button>
  );
}
