import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4">
      <div className="flex max-w-[420px] flex-col items-center text-center">
        <Link href="/" aria-label="ShipOrSkip home" className="mb-10 text-ink no-underline hover:no-underline">
          <Logo tagline />
        </Link>
        <div className="mb-2 text-[13px] text-muted-2">404 · Skipped</div>
        <h1 className="wiki-rule m-0 mb-3 text-[32px] leading-tight">This page never shipped.</h1>
        <p className="m-0 mb-6 text-muted-2">It might have been moved, or it was one of those side projects. You know how it goes.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/feed" className="btn btn-primary">Vote on projects</Link>
          <Link href="/" className="btn btn-normal">Home</Link>
        </div>
      </div>
    </div>
  );
}
