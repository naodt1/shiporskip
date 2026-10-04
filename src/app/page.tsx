import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ChevronUp, Clock, GitHubMark, Grid } from "@/components/icons";
import { LandingDemo } from "@/components/LandingDemo";
import { CountUp, HeroHeadline, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Logo, Mark } from "@/components/Logo";
import { Eyebrow, SiteFooter } from "@/components/SiteFooter";
import { getUser } from "@/lib/auth";
import { BOOST_HOURS, BOOST_PRICE_CENTS, CAMPAIGN_DAYS, MAX_PROJECTS, MIN_COMMITS, MIN_PROJECTS, appUrl } from "@/lib/config";
import { timeShort } from "@/lib/format";
import { getFeed, getShippedBoard, getStats } from "@/lib/queries";

export default async function Landing() {
  const user = await getUser();
  const [today, shipped, stats] = await Promise.all([getFeed("hot", user?.id ?? null, 4), getShippedBoard(12), getStats()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "ShipOrSkip", url: appUrl(), description: "Builders vote. You ship. Post your unfinished side projects and let other builders pick the one worth finishing." },
      { "@type": "Organization", name: "ShipOrSkip", url: appUrl(), logo: `${appUrl()}/icon-512.png` },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="sticky top-0 z-5 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] items-center gap-6 px-4 py-3 sm:px-5">
          <Link href="/" aria-label="ShipOrSkip home" className="no-underline"><Logo /></Link>
          <nav className="hidden gap-5 text-[15px] sm:flex">
            <a href="#how" className="nav-link text-muted no-underline">How it works</a>
            <a href="#today" className="nav-link text-muted no-underline">Voting now</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            {!user && <Link href="/feed?login=1" className="px-2 py-[7px] text-[15px] whitespace-nowrap no-underline">Log in</Link>}
            <Link href="/feed?post=1" className="press cta-glow rounded-md bg-green px-3.5 py-2 text-[15px] font-semibold whitespace-nowrap text-white no-underline hover:bg-green-hover hover:text-white">Post projects</Link>
          </div>
        </div>
      </header>

      <div className="brand-grid border-b border-border">
      <section className="mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-12 px-4 pt-12 pb-16 sm:gap-14 sm:px-5 sm:pt-20 sm:pb-24">
        <div>
          <Reveal y={8}>
            {stats.live > 0 ? (
              <Link href="/feed" className="mb-5 inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/80 py-1 pr-3 pl-2.5 text-[13px] font-semibold text-green-text no-underline shadow-sm backdrop-blur hover:border-green/40 hover:text-green-text">
                <span className="live-dot" />
                {stats.live} campaign{stats.live === 1 ? "" : "s"} voting now
                <span className="text-green">→</span>
              </Link>
            ) : (
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/80 py-1 pr-3 pl-2.5 text-[13px] font-semibold text-green-text shadow-sm">
                <span className="live-dot" />
                For builders with a graveyard of side projects
              </span>
            )}
          </Reveal>
          <HeroHeadline
            lines={["Builders vote.", "You"]}
            accent="ship."
            className="m-0 mb-6 text-[clamp(50px,6.6vw,80px)] leading-[.98] font-bold tracking-[-.05em]"
          />
          <Reveal delay={0.55} y={10}>
            <p className="m-0 mb-8 max-w-[460px] text-[19px] leading-relaxed text-pretty text-muted">
              Too many side projects? Post {MIN_PROJECTS}–{MAX_PROJECTS} from GitHub. Other builders pick the one worth finishing, and tell you why. <b className="font-semibold text-ink">You get your answer in {CAMPAIGN_DAYS} days.</b>
            </p>
          </Reveal>
          <Reveal delay={0.68} y={10}>
            <div className="flex flex-wrap gap-3">
              <Link href="/feed?post=1" className="press cta-glow flex flex-1 items-center justify-center gap-2 rounded-xl bg-green px-5.5 py-3.5 text-base font-semibold whitespace-nowrap text-white no-underline hover:bg-green-hover hover:text-white sm:flex-none">
                <GitHubMark />
                Post from GitHub
              </Link>
              <Link href="/feed" className="press flex-1 rounded-xl border border-outline bg-white px-5.5 py-[13px] text-center text-base font-semibold whitespace-nowrap no-underline hover:border-ink sm:flex-none">
                Vote on projects
              </Link>
            </div>
            <p className="m-0 mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-3">
              <span>✓ Free to post</span>
              <span>✓ Read-only GitHub access</span>
              <span>✓ Answer in {CAMPAIGN_DAYS} days</span>
            </p>
          </Reveal>
        </div>
        <LandingDemo />
      </section>
      </div>

      {stats.votes > 0 && (
        <section className="border-b border-border bg-white">
          <Stagger className="mx-auto grid max-w-[1120px] grid-cols-3 divide-x divide-divider px-4 sm:px-5">
            {[
              [stats.live, "campaigns live"],
              [stats.votes, "votes cast"],
              [stats.shipped, "projects shipped"],
            ].map(([n, label]) => (
              <StaggerItem key={label} className="flex flex-col items-center gap-0.5 px-2 py-6 text-center sm:py-8">
                <CountUp to={n as number} className="font-mono text-[26px] font-bold tracking-[-.03em] text-ink tabular-nums sm:text-[36px]" />
                <span className="text-[13px] text-muted-2 sm:text-sm">{label}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {shipped.length > 0 && (
        <div className="marquee-mask overflow-hidden border-b border-border bg-bg py-3" aria-label="Recently shipped">
          <div className="marquee gap-3">
            {[...shipped, ...shipped].map((s, i) => (
              <span key={i} aria-hidden={i >= shipped.length} className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-white py-1.5 pr-3.5 pl-2 text-[14px] whitespace-nowrap">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-green-tint-2 text-[12px]">🚀</span>
                <b>{s.title}</b>
                <span className="text-muted-3">{s.sub}</span>
                <span className="font-mono text-xs font-bold text-green">shipped in {s.days}d</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <section id="how" className="mx-auto max-w-[1120px] scroll-mt-16 px-4 pt-16 pb-14 sm:px-5 sm:pt-24 sm:pb-20">
        <Reveal>
          <Eyebrow tone="green" className="mb-2">How it works</Eyebrow>
          <h2 className="m-0 mb-8 max-w-[560px] text-[clamp(28px,3.6vw,40px)] leading-[1.08] font-bold tracking-[-.035em] text-balance">Three days from “which one?” to “this one.”</h2>
        </Reveal>
        <Stagger className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
          {(
            [
              ["01", "Line up your contenders", `Pick ${MIN_PROJECTS}–${MAX_PROJECTS} public repos you’ve started but not released. Add a screenshot and an early-access offer.`, <GitHubMark key="i" />],
              ["02", "Builders vote, with reasons", `Campaigns run ${CAMPAIGN_DAYS} days. One vote per person, plus a line on why. Voters unlock your offer.`, <ChevronUp key="i" size={18} />],
              ["03", "Commit and ship", "Publicly commit to the winner, then mark it shipped when it’s live. No more maybe-next-weekend.", <span key="i" className="text-[15px]">🚀</span>],
            ] as const
          ).map(([n, t, d, icon]) => (
            <StaggerItem key={n} lift className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(39,37,37,.25)]">
              <span aria-hidden className="pointer-events-none absolute -top-6 -right-2 font-mono text-[96px] leading-none font-bold text-fill-2 transition-colors group-hover:text-green-tint-3">{n}</span>
              <div className="relative mb-5 grid h-11 w-11 place-items-center rounded-xl bg-green text-white shadow-[0_8px_20px_-8px_rgba(51,96,33,.6)]">{icon}</div>
              <div className="relative mb-1.5 text-lg font-bold tracking-[-.01em]">{t}</div>
              <div className="relative text-[15px] text-pretty text-muted-2">{d}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section id="today" className="mx-auto flex max-w-[1120px] scroll-mt-16 flex-wrap items-start gap-7 px-4 pt-2 pb-14 sm:px-5 sm:pb-20">
        <div className="min-w-0 flex-[2_1_520px] max-sm:basis-full">
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className="m-0 flex items-center gap-2.5 text-xl font-bold tracking-[-.025em] sm:text-[26px]"><span className="live-dot" />Voting now</h2>
            <Link href="/feed" className="text-sm font-semibold text-green no-underline">See all →</Link>
          </div>
          <Stagger className="overflow-hidden rounded-2xl border border-border bg-white">
            {today.length === 0 && <p className="m-0 px-4 py-6 text-center text-sm text-muted-2">No campaigns yet. <Link href="/feed?post=1" className="font-semibold text-green no-underline">Post the first one →</Link></p>}
            {today.map((t, i) => (
              <StaggerItem key={t.id} className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-4 transition-colors hover:bg-bg sm:gap-3.5 sm:px-5 ${i ? "border-t border-divider" : ""}`}>
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
                  className={`press flex w-14 flex-col items-center rounded-xl border py-1.5 no-underline hover:border-green ${t.voted ? "border-green bg-green-tint-2 text-green-text hover:text-green-text" : "border-border bg-white text-muted hover:text-muted"}`}
                >
                  <ChevronUp size={14} />
                  <span className="font-mono text-[13px] font-bold">{t.total}</span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal className="flex flex-[1_1_280px] flex-col gap-3.5 max-sm:basis-full" delay={0.1}>
          <div className="rounded-2xl border border-border bg-white p-5">
            <Eyebrow className="mb-2.5">Shipped after the vote</Eyebrow>
            {shipped.length === 0 && <div className="text-sm text-muted-3">Nobody’s shipped yet. Could be you.</div>}
            {shipped.slice(0, 4).map((s, i) => (
              <div key={i} className={`flex justify-between gap-2.5 py-[7px] text-[15px] ${i ? "border-t border-divider" : ""}`}>
                <span><b>{s.title}</b> <span className="text-muted-3">{s.sub}</span></span>
                <span className="font-mono text-[13px] text-green">{s.days}d</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <Eyebrow className="mb-2.5">House rules</Eyebrow>
            <div className="flex flex-col gap-2 text-[15px]">
              {["Public GitHub repos only", `Started: ${MIN_COMMITS}+ commits`, "Not finished: no release yet", `Free to post. $${BOOST_PRICE_CENTS / 100} to boost for ${BOOST_HOURS}h.`].map((r) => (
                <span key={r} className="flex gap-2"><span className="font-bold text-green">✓</span>{r}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal as="section" className="mx-auto max-w-[1120px] px-4 pb-14 sm:px-5 sm:pb-20">
        <div className="cta-dark relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white sm:px-12 sm:py-16">
          <Mark size={260} className="float-slow pointer-events-none absolute -right-12 -bottom-20 opacity-[.09] max-sm:hidden" />
          <div className="relative">
            <Eyebrow tone="accent" className="mb-2">Ship it or skip it</Eyebrow>
            <h2 className="m-0 mb-2 text-[28px] leading-[1.08] font-bold tracking-[-.035em] sm:text-[44px]">Which one should you finish?</h2>
            <p className="m-0 text-faint">Stop guessing. Get a straight answer in {CAMPAIGN_DAYS} days.</p>
          </div>
          <Link href="/feed?post=1" className="press cta-glow relative rounded-xl bg-green px-6 py-3.5 text-base font-semibold text-white no-underline hover:bg-green-hover hover:text-white">Post your projects →</Link>
        </div>
      </Reveal>

      <SiteFooter />
    </div>
  );
}
