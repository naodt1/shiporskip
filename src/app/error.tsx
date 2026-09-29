"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="brand-grid grid min-h-screen place-items-center px-4">
      <div className="flex max-w-[420px] flex-col items-center text-center">
        <Link href="/" aria-label="ShipOrSkip home" className="mb-10 no-underline">
          <Logo />
        </Link>
        <div className="mb-2 font-mono text-sm font-bold tracking-[.08em] text-urgent uppercase">Something broke</div>
        <h1 className="m-0 mb-2 text-[32px] leading-tight font-bold tracking-[-.03em]">We shipped a bug.</h1>
        <p className="m-0 mb-6 text-muted-2">Ironic, we know. Try again, and if it keeps happening, it’s on our list.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => retry()} className="rounded-md bg-green px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-green-hover">Try again</button>
          <Link href="/feed" className="rounded-md border border-outline bg-white px-4 py-2.5 text-[15px] font-semibold no-underline">Back to the feed</Link>
        </div>
      </div>
    </div>
  );
}
