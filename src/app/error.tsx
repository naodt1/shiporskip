"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4">
      <div className="flex max-w-[420px] flex-col items-center text-center">
        <Link href="/" aria-label="ShipOrSkip home" className="mb-10 text-ink no-underline hover:no-underline">
          <Logo tagline />
        </Link>
        <div className="mb-2 text-[13px] text-muted-2">Something broke</div>
        <h1 className="wiki-rule m-0 mb-3 text-[32px] leading-tight">We shipped a bug.</h1>
        <p className="m-0 mb-6 text-muted-2">Ironic, we know. Try again, and if it keeps happening, it’s on our list.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => retry()} className="btn btn-primary">Try again</button>
          <Link href="/feed" className="btn btn-normal">Back to the feed</Link>
        </div>
      </div>
    </div>
  );
}
