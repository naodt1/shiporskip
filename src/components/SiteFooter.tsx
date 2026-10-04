import Link from "next/link";
import { Mark } from "./Logo";

const LINKS: [string, string][] = [
  ["Vote on projects", "/feed"],
  ["Post your projects", "/feed?post=1"],
  ["Leaderboards", "/leaderboards"],
  ["About ShipOrSkip", "/about"],
  ["Brand kit", "/brand"],
];

/** Shared by the landing page and the app shell. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-fill-2">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-start justify-between gap-6 px-4 py-6 text-[13px] text-muted-2 sm:px-5">
        <div className="flex max-w-[640px] flex-col gap-2">
          <p className="m-0">
            ShipOrSkip is where builders vote on which unfinished side project you should finish. Projects are real public GitHub repositories; votes and reasons are
            written by the community.
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
          <p className="m-0 text-muted-3">© {new Date().getFullYear()} ShipOrSkip. Builders vote. You ship.</p>
        </div>
        <Link href="/" aria-label="ShipOrSkip home" className="flex items-center gap-2 border border-border bg-white px-2.5 py-1.5 text-ink no-underline hover:no-underline">
          <Mark size={22} />
          <span className="font-serif text-[15px] leading-none">ShipOrSkip</span>
        </Link>
      </div>
    </footer>
  );
}
