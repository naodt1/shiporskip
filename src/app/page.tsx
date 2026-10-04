import Link from "next/link";
import { LandingDemo } from "@/components/LandingDemo";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion";
import { SiteFooter } from "@/components/SiteFooter";
import { getUser } from "@/lib/auth";
import { BOOST_HOURS, BOOST_PRICE_CENTS, CAMPAIGN_DAYS, MAX_PROJECTS, MIN_COMMITS, MIN_PROJECTS, appUrl } from "@/lib/config";
import { closesLabel, pct, timeShort } from "@/lib/format";
import { getCampaign, getFeed, getShippedBoard, getStats } from "@/lib/queries";

const n = (x: number) => x.toLocaleString("en-US");

export default async function Landing() {
  const user = await getUser();
  const [today, shipped, stats] = await Promise.all([getFeed("hot", user?.id ?? null, 6), getShippedBoard(5), getStats()]);
  const featured = today[0] ? await getCampaign(today[0].id, user?.id ?? null) : null;
  const featuredTotal = featured?.projects.reduce((a, p) => a + p.votes, 0) ?? 0;
  const featuredLead = Math.max(0, ...(featured?.projects.map((p) => p.votes) ?? [0]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "ShipOrSkip", url: appUrl(), description: "Builders vote. You ship. Post your unfinished side projects and let other builders pick the one worth finishing." },
      { "@type": "Organization", name: "ShipOrSkip", url: appUrl(), logo: `${appUrl()}/icon-512.png` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1120px] items-center gap-6 px-4 py-3 sm:px-5">
          <Link href="/" aria-label="ShipOrSkip home" className="text-ink no-underline hover:no-underline">
            <Logo tagline />
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-[14px]">
            <Link href="/feed" className="max-sm:hidden">Vote on projects</Link>
            <Link href="/leaderboards" className="max-md:hidden">Leaderboards</Link>
            {!user && <Link href="/feed?login=1">Log in</Link>}
            <Link href="/feed?post=1" className="btn btn-primary text-[14px]">Post projects</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-6 pb-12 sm:px-5">
        {/* Welcome banner */}
        <Reveal y={6} className="wiki-box mb-5 px-5 py-6 text-center sm:py-8">
          <h1 className="m-0 text-[clamp(32px,5vw,46px)] leading-[1.15]">Builders vote. You ship.</h1>
          <p className="mx-auto mt-2 mb-0 max-w-[640px] text-[16px] text-pretty sm:text-[17px]">
            Welcome to <b>ShipOrSkip</b>, where other builders pick which of your unfinished side projects you should finish. Post {MIN_PROJECTS}–{MAX_PROJECTS} repos from
            GitHub and get your answer, with reasons, in {CAMPAIGN_DAYS} days.
          </p>
          <p className="mt-2 mb-4 text-[14px] text-muted-2">
            <b className="text-ink">{n(stats.live)}</b> campaigns voting now · <b className="text-ink">{n(stats.votes)}</b> votes cast · <b className="text-ink">{n(stats.shipped)}</b> projects shipped
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/feed?post=1" className="btn btn-primary btn-lg">Post your projects</Link>
            <Link href="/feed" className="btn btn-normal btn-lg">Vote on projects</Link>
          </div>
        </Reveal>

        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            {/* Featured campaign */}
            <Reveal delay={0.05} className="wiki-box">
              <h2 className="wiki-box-head">Today’s featured campaign</h2>
              <div className="bg-white p-4">
                {featured ? (
                  <>
                    <p className="m-0 mb-1 text-[13px] text-muted-2">
                      Posted by <Link href={`/c/${featured.id}`}>@{featured.handle}</Link> · {n(featured.total)} votes · {closesLabel(featured.closesAt)}
                    </p>
                    <h3 className="m-0 mb-3 font-serif text-[22px] leading-snug font-normal">
                      <Link href={`/c/${featured.id}`}>{featured.title}</Link>
                    </h3>
                    <table className="wikitable text-[14px]">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th className="max-sm:hidden">Description</th>
                          <th className="w-[96px] text-right">Votes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {featured.projects.map((p) => {
                          const lead = featuredTotal > 0 && p.votes === featuredLead;
                          return (
                            <tr key={p.id}>
                              <td className="whitespace-nowrap">
                                <Link href={`/c/${featured.id}/p/${p.id}`} className={lead ? "font-bold" : ""}>{p.name}</Link>
                              </td>
                              <td className="text-muted-2 max-sm:hidden">{p.oneliner}</td>
                              <td className="text-right whitespace-nowrap">{pct(p.votes, featuredTotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <p className="mt-3 mb-0 text-right text-[14px]">
                      <Link href={`/c/${featured.id}`}>Cast your vote →</Link>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="m-0 mb-3 text-[14px] text-muted-2">No campaigns are open yet. Here is how one looks; tap the project you’d ship.</p>
                    <LandingDemo />
                  </>
                )}
              </div>
            </Reveal>

            {/* How it works */}
            <Reveal delay={0.1} className="wiki-box" as="section">
              <h2 className="wiki-box-head" id="how">How it works</h2>
              <ol className="m-0 flex flex-col gap-2.5 bg-white py-4 pr-4 pl-9 text-[15px]">
                <li>
                  <b>Line up your contenders.</b> Pick {MIN_PROJECTS}–{MAX_PROJECTS} public GitHub repos you’ve started but not released. Add a screenshot and, if you like, an
                  early-access offer for voters.
                </li>
                <li>
                  <b>Builders vote, with reasons.</b> Campaigns run {CAMPAIGN_DAYS} days. Each person gets one vote and a line on why. Voters unlock your offer.
                </li>
                <li>
                  <b>Commit and ship.</b> Publicly commit to the winner, then mark it shipped when it’s live.
                </li>
              </ol>
            </Reveal>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Reveal delay={0.08} className="wiki-box" as="section">
              <h2 className="wiki-box-head" id="today">Voting now</h2>
              <ul className="m-0 flex list-disc flex-col gap-2 bg-white py-3.5 pr-4 pl-8 text-[15px]">
                {today.length === 0 && (
                  <li>
                    Nothing yet. <Link href="/feed?post=1">Post the first campaign</Link>.
                  </li>
                )}
                {today.map((t) => (
                  <li key={t.id}>
                    <Link href={`/c/${t.id}`}>{t.title}</Link>
                    <span className="text-[13px] text-muted-2">
                      {" "}
                      by @{t.handle} · {t.total} votes · {timeShort(t.closesAt)} left
                    </span>
                  </li>
                ))}
              </ul>
              {today.length > 0 && (
                <p className="m-0 border-t border-divider bg-white px-4 py-2 text-right text-[14px]">
                  <Link href="/feed">All campaigns →</Link>
                </p>
              )}
            </Reveal>

            <Reveal delay={0.12} className="wiki-box" as="section">
              <h2 className="wiki-box-head">Recently shipped</h2>
              <ul className="m-0 flex list-disc flex-col gap-1.5 bg-white py-3.5 pr-4 pl-8 text-[15px]">
                {shipped.length === 0 && <li>Nobody has shipped yet. It could be you.</li>}
                {shipped.map((s, i) => (
                  <li key={i}>
                    <b>{s.title}</b> by {s.sub} shipped {s.days} day{s.days === 1 ? "" : "s"} after the vote.
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.16} className="wiki-box" as="section">
              <h2 className="wiki-box-head">Did you know…</h2>
              <ul className="m-0 flex list-disc flex-col gap-1.5 bg-white py-3.5 pr-4 pl-8 text-[15px]">
                <li>… that only public GitHub repositories can be posted?</li>
                <li>… that a project needs at least {MIN_COMMITS} commits, so ideas alone don’t count?</li>
                <li>… that a project with a release can’t be posted, because it’s already finished?</li>
                <li>
                  … that posting is free, and a boost costs ${BOOST_PRICE_CENTS / 100} for {BOOST_HOURS} hours?
                </li>
              </ul>
            </Reveal>
          </div>
        </div>

        <Reveal className="wiki-box mt-5 px-5 py-5 text-center">
          <h2 className="m-0 text-[26px]">Which one should you finish?</h2>
          <p className="mt-1 mb-3 text-[15px] text-muted-2">Stop guessing. Get a straight answer in {CAMPAIGN_DAYS} days.</p>
          <Link href="/feed?post=1" className="btn btn-primary btn-lg">Post your projects</Link>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
