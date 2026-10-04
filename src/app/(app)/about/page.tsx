import Link from "next/link";
import { Mark } from "@/components/Logo";
import { PageHeader } from "@/components/PageHeader";
import { BOOST_HOURS, BOOST_PRICE_CENTS, CAMPAIGN_DAYS, MAX_PROJECTS, MIN_COMMITS, MIN_PROJECTS } from "@/lib/config";

export const metadata = {
  title: "About",
  description: "ShipOrSkip helps indie hackers decide which unfinished side project to finish. Post 2–5 projects, builders vote, you get a clear answer.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES: [string, string][] = [
  ["Real repos only", "Every project links to a public GitHub repository with real commits. No pitch decks, no vaporware."],
  ["Reasons over reactions", "A vote is one click, but the line on why is what actually helps a builder decide."],
  ["Commit in public", "When the vote closes, the builder says which project they are finishing."],
  ["Shipping is the score", "The leaderboard that counts ranks finished projects, fastest first."],
];

export default function AboutPage() {
  return (
    <div className="max-w-[860px]">
      <PageHeader title="About ShipOrSkip" />

      {/* Infobox */}
      <table className="wikitable mb-4 w-full text-[13px] sm:float-right sm:mb-3 sm:ml-5 sm:w-[260px]">
        <caption className="bg-fill-2 px-2 pt-2 font-serif text-[17px] font-bold">ShipOrSkip</caption>
        <tbody>
          <tr>
            <td colSpan={2} className="bg-white py-4 text-center">
              <Mark size={64} className="mx-auto block" />
              <div className="mt-2 font-serif italic">Builders vote. You ship.</div>
            </td>
          </tr>
          <tr><th>Type</th><td className="bg-white">Community voting site</td></tr>
          <tr><th>Projects</th><td className="bg-white">{MIN_PROJECTS}–{MAX_PROJECTS} per campaign</td></tr>
          <tr><th>Vote length</th><td className="bg-white">{CAMPAIGN_DAYS} days</td></tr>
          <tr><th>Eligibility</th><td className="bg-white">Public repo, {MIN_COMMITS}+ commits, no release</td></tr>
          <tr><th>Cost</th><td className="bg-white">Free; boost ${BOOST_PRICE_CENTS / 100} for {BOOST_HOURS}h</td></tr>
        </tbody>
      </table>

      <div className="text-[15px] leading-[1.65] [&_p]:my-3">
        <p className="mt-0">
          <b>ShipOrSkip</b> is a community website where independent developers post the side projects they have started but not finished, and other builders vote on
          which one they should complete. Its slogan is <i>“Builders vote. You ship.”</i>
        </p>
        <p>
          Every builder has a folder of side projects stuck at 60%. Picking which one to finish is the hardest part, so most never do: they start another one.
          ShipOrSkip hands that decision to the people who would actually use the thing.
        </p>

        <h2 className="wiki-rule mt-6 mb-2 text-[24px]">How it works</h2>
        <p>
          A builder posts {MIN_PROJECTS}–{MAX_PROJECTS} unfinished repositories as a <i>campaign</i>. For {CAMPAIGN_DAYS} days, other builders each cast one vote and can
          add a short reason. When the vote closes, the builder commits to the winner in public and marks it shipped once it is live.
        </p>

        <h2 className="wiki-rule mt-6 mb-2 text-[24px]">Principles</h2>
        <dl className="m-0">
          {PRINCIPLES.map(([t, d]) => (
            <div key={t} className="mb-2">
              <dt className="font-bold">{t}</dt>
              <dd className="m-0 pl-6">{d}</dd>
            </div>
          ))}
        </dl>

        <h2 className="wiki-rule mt-6 mb-2 text-[24px]">See also</h2>
        <ul className="m-0 pl-6">
          <li><Link href="/feed?post=1">Post your projects</Link></li>
          <li><Link href="/feed">Campaigns open for voting</Link></li>
          <li><Link href="/leaderboards">Leaderboards</Link></li>
          <li><Link href="/brand">Brand kit</Link></li>
        </ul>
      </div>
    </div>
  );
}
