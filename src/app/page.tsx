import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ChevronUp, Clock, GitHubMark, Grid } from "@/components/icons";
import { LandingDemo } from "@/components/LandingDemo";
import { getUser } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { timeShort } from "@/lib/format";
import { getFeed, getShippedBoard } from "@/lib/queries";

export default async function Landing() {
  const user = await getUser();
  const [today, shipped] = await Promise.all([getFeed("hot", user?.id ?? null, 4), getShippedBoard(4)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "ShipOrSkip", url: appUrl(), description: "Let builders pick which side project you finish." },
      { "@type": "Organization", name: "ShipOrSkip", url: appUrl(), logo: `${appUrl()}/icon-512.png` },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="sticky top-0 z-5 border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1120px] items-center gap-6 px-4 py-3 sm:px-5">
          <Link href="/feed" className="font-mono text-base font-bold no-underline">shiporskip</Link>
          <nav className="hidden gap-5 text-[15px] sm:flex">
            <a href="#how" className="text-muted no-underline">How it works</a>
            <a href="#today" className="text-muted no-underline">Today</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            {!user && <Link href="/feed?login=1" className="px-2 py-[7px] text-[15px] whitespace-nowrap no-underline">Log in</Link>}
            <Link href="/feed?post=1" className="rounded-md bg-ink px-3.5 py-2 text-[15px] font-semibold whitespace-nowrap text-white no-underline hover:text-white">Post projects</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-10 px-4 pt-10 pb-12 sm:gap-12 sm:px-5 sm:pt-18 sm:pb-14">
        <div>
          <span className="mb-4.5 inline-flex items-center gap-1.5 rounded-full bg-green-tint-2 px-2.5 py-[3px] text-[13px] font-semibold text-green-text">
            For indie hackers with too many side projects
          </span>
          <h1 className="m-0 mb-4 text-[clamp(36px,5vw,54px)] leading-[1.05] font-bold tracking-[-.02em] text-balance">Stop starting. Let builders pick the one you finish.</h1>
          <p className="m-0 mb-7 max-w-[460px] text-lg text-pretty text-muted">Post 2–5 unfinished projects from GitHub. The community votes. You ship the winner.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/feed?post=1" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green px-5 py-3 whitespace-nowrap sm:flex-none text-base font-semibold text-white no-underline hover:bg-green-hover hover:text-white">
              <GitHubMark />
              Post from GitHub
            </Link>
            <Link href="/feed" className="flex-1 rounded-lg border border-outline bg-white px-5 py-[11px] text-center text-base font-semibold whitespace-nowrap no-underline sm:flex-none">Start voting</Link>
          </div>
        </div>
        <LandingDemo />
      </section>

      <section id="how" className="mx-auto max-w-[1120px] px-4 pt-6 pb-12 sm:px-5 sm:pt-10 sm:pb-14">
        <h2 className="m-0 mb-5 text-2xl font-bold">How it works</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-3.5">
          {[
            ["01", "Connect GitHub", "Pick 2–5 repos you've started. Add an image and an offer."],
            ["02", "Builders vote", "One tap per campaign, with an optional reason."],
            ["03", "Ship the winner", "Commit to it. Voters get pinged when it launches."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-[10px] border border-border bg-white p-5">
              <div className="mb-2.5 font-mono text-[13px] font-bold text-green">{n}</div>
              <div className="mb-1 font-bold">{t}</div>
              <div className="text-[15px] text-muted-2">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="today" className="mx-auto flex max-w-[1120px] flex-wrap items-start gap-7 px-4 pt-4 pb-12 sm:px-5 sm:pb-16">
        <div className="min-w-0 flex-[2_1_520px] max-sm:basis-full">
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className="m-0 text-xl font-bold sm:text-2xl">Top campaigns today</h2>
            <Link href="/feed" className="text-sm font-semibold text-green no-underline">See all →</Link>
          </div>
          <div className="overflow-hidden rounded-[10px] border border-border bg-white">
            {today.length === 0 && <p className="m-0 px-4 py-6 text-center text-sm text-muted-2">No campaigns yet.</p>}
            {today.map((t, i) => (
              <div key={t.id} className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-3.5 sm:gap-3.5 sm:px-4 ${i ? "border-t border-divider" : ""}`}>
                <span className="font-mono text-sm font-bold text-muted-3">{i + 1}</span>
                <div className="flex min-w-0 flex-col gap-1">
                  <Link href={`/c/${t.id}`} className="leading-snug font-semibold no-underline">{t.title}</Link>
                  <span className="flex flex-wrap items-center gap-2.5 text-[13px] text-muted-2">
                    <span className="flex items-center gap-1.5"><Avatar handle={t.handle} url={t.avatarUrl} size={18} />@{t.handle}</span>
                    <span className="flex items-center gap-1"><Grid size={13} />{t.count}</span>
                    <span className="flex items-center gap-1 font-mono text-xs"><Clock size={12} />{timeShort(t.closesAt)}</span>
                  </span>
                </div>
                <Link
                  href={`/c/${t.id}`}
                  aria-label={t.voted ? "Voted" : "Vote"}
                  className={`flex w-14 flex-col items-center rounded-lg border py-1.5 no-underline hover:border-green ${t.voted ? "border-green bg-green-tint-2 text-green-text hover:text-green-text" : "border-border bg-white text-muted hover:text-muted"}`}
                >
                  <ChevronUp size={14} />
                  <span className="font-mono text-[13px] font-bold">{t.total}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-[1_1_280px] flex-col gap-3.5 max-sm:basis-full">
          <div className="rounded-[10px] border border-border bg-white p-4">
            <div className="mb-2.5 text-[11px] tracking-[.06em] text-muted-3 uppercase">Shipped after the vote</div>
            {shipped.length === 0 && <div className="text-sm text-muted-3">First ship coming soon.</div>}
            {shipped.map((s, i) => (
              <div key={i} className={`flex justify-between gap-2.5 py-[7px] text-[15px] ${i ? "border-t border-divider" : ""}`}>
                <span><b>{s.title}</b> <span className="text-muted-3">{s.sub}</span></span>
                <span className="font-mono text-[13px] text-green">{s.days}d</span>
              </div>
            ))}
          </div>
          <div className="rounded-[10px] border border-border bg-white p-4">
            <div className="mb-2.5 text-[11px] tracking-[.06em] text-muted-3 uppercase">Rules</div>
            <div className="flex flex-col gap-2 text-[15px]">
              {["Real GitHub repos only", "Started, not finished", "Free to post. $9 to boost."].map((r) => (
                <span key={r} className="flex gap-2"><span className="font-bold text-green">✓</span>{r}</span>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1120px] px-4 pb-12 sm:px-5 sm:pb-18">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[14px] bg-ink px-6 py-8 text-white sm:px-8 sm:py-10">
          <div>
            <h2 className="m-0 mb-1.5 text-2xl leading-[1.15] font-bold sm:text-[28px]">Which one should you finish?</h2>
            <p className="m-0 text-faint">Find out in 3 days.</p>
          </div>
          <Link href="/feed?post=1" className="rounded-lg bg-green px-5.5 py-3 text-base font-semibold text-white no-underline hover:bg-green-hover hover:text-white">Post your projects</Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1120px] flex-wrap justify-between gap-4 px-4 py-5 text-sm text-muted-3 sm:px-5">
          <span className="font-mono">shiporskip</span>
          <span>Made by Your Name</span>
        </div>
      </footer>
    </div>
  );
}
