"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./AppContext";
import { LinkIcon } from "./icons";

export function ShareButton({ id }: { id: string }) {
  const { toast } = useApp();
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  const share = () => {
    const url = `${window.location.origin}/c/${id}`;
    const done = () => {
      setCopied(true);
      toast("Link copied");
      clearTimeout(t.current);
      t.current = setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, done);
    else done();
  };

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
