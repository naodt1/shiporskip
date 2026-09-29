import Link from "next/link";
import { Logo } from "./Logo";

const COLS: [string, [string, string][]][] = [
  ["Product", [["Vote on projects", "/feed"], ["Post your projects", "/feed?post=1"], ["Leaderboards", "/leaderboards"]]],
  ["ShipOrSkip", [["About", "/about"], ["Brand kit", "/brand"]]],
];

/** Shared by the landing page and the app shell. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap justify-between gap-x-12 gap-y-8 px-4 pt-10 pb-8 sm:px-5">
        <div className="flex max-w-[320px] flex-col gap-3">
          <Link href="/" aria-label="ShipOrSkip home" className="no-underline">
            <Logo />
          </Link>
          <p className="m-0 text-[15px] text-pretty text-muted-2">Ship it or skip it. Builders help you pick the side project worth finishing.</p>
        </div>
        <div className="flex gap-14">
          {COLS.map(([head, links]) => (
            <div key={head} className="flex flex-col gap-2">
              <Eyebrow className="mb-1">{head}</Eyebrow>
              {links.map(([label, href]) => (
                <Link key={href} href={href} className="text-[15px] text-muted no-underline hover:text-green">
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1120px] px-4 sm:px-5">
        <div className="flex flex-wrap justify-between gap-2 border-t border-divider py-4 font-mono text-xs text-muted-3">
          <span>© {new Date().getFullYear()} ShipOrSkip</span>
          <span>Made for people who start more than they finish.</span>
        </div>
      </div>
    </footer>
  );
}

/** Small uppercase mono label used above headings and in cards. */
export function Eyebrow({ children, className = "", tone = "muted" }: { children: React.ReactNode; className?: string; tone?: "muted" | "green" | "bright" }) {
  return (
    <div className={`font-mono text-[11px] font-bold tracking-[.08em] uppercase ${{ muted: "text-muted-3", green: "text-green", bright: "text-green-bright" }[tone]} ${className}`}>{children}</div>
  );
}
