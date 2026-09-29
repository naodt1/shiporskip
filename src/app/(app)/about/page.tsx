import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Eyebrow } from "@/components/SiteFooter";
import { CAMPAIGN_DAYS, MAX_PROJECTS, MIN_PROJECTS } from "@/lib/config";

export const metadata = {
  title: "About",
  description: "ShipOrSkip helps indie hackers decide which unfinished side project to finish. Post 2–5 projects, builders vote, you get a clear answer.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES: [string, string][] = [
  ["Real repos only", "Every project links to a public GitHub repo with real commits. No pitch decks, no vaporware."],
  ["Reasons over reactions", "A vote is one tap, but the line on why is what actually helps a builder decide."],
  ["Commit in public", "When the vote closes, you say which one you’re finishing. Out loud. That’s the point."],
  ["Shipping is the score", "The leaderboard that counts ranks finished projects, fastest first."],
];

export default function AboutPage() {
  return (
    <div className="max-w-[640px]">
      <PageHeader eyebrow="About" title="Finish something." />
      <div className="flex flex-col gap-3 text-[17px] text-pretty">
        <p className="m-0">
          Every builder has a folder of side projects stuck at 60%. Picking which one to finish is the hardest part, so most of us don’t. We start another one.
        </p>
        <p className="m-0">
          ShipOrSkip hands that decision to the people who’d actually use the thing. Post {MIN_PROJECTS}–{MAX_PROJECTS} unfinished repos. For {CAMPAIGN_DAYS} days,
          other builders vote and tell you why. Then you commit to the winner and ship it.
        </p>
        <p className="m-0 font-semibold">Ship it or skip it. Either way, you stop wondering.</p>
      </div>

      <Eyebrow className="mt-10 mb-3">What we believe</Eyebrow>
      <div className="grid gap-3 sm:grid-cols-2">
        {PRINCIPLES.map(([t, d]) => (
          <div key={t} className="rounded-[10px] border border-border bg-white p-4">
            <div className="mb-1 font-bold">{t}</div>
            <div className="text-[15px] text-muted-2">{d}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/feed?post=1" className="rounded-md bg-green px-4 py-2.5 text-[15px] font-semibold text-white no-underline hover:bg-green-hover hover:text-white">
          Post your projects
        </Link>
        <Link href="/brand" className="rounded-md border border-outline bg-white px-4 py-2.5 text-[15px] font-semibold no-underline">
          Brand kit
        </Link>
      </div>
    </div>
  );
}
