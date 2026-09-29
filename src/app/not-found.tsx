import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="brand-grid grid min-h-screen place-items-center px-4">
      <div className="flex max-w-[420px] flex-col items-center text-center">
        <Link href="/" aria-label="ShipOrSkip home" className="mb-10 no-underline">
          <Logo />
        </Link>
        <div className="mb-2 font-mono text-sm font-bold tracking-[.08em] text-green uppercase">404 · Skipped</div>
        <h1 className="m-0 mb-2 text-[32px] leading-tight font-bold tracking-[-.03em]">This page never shipped.</h1>
        <p className="m-0 mb-6 text-muted-2">It might have been moved, or it was one of those side projects. You know how it goes.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/feed" className="rounded-md bg-green px-4 py-2.5 text-[15px] font-semibold text-white no-underline hover:bg-green-hover hover:text-white">Vote on projects</Link>
          <Link href="/" className="rounded-md border border-outline bg-white px-4 py-2.5 text-[15px] font-semibold no-underline">Home</Link>
        </div>
      </div>
    </div>
  );
}
