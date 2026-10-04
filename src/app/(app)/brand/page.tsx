import { Logo, Mark } from "@/components/Logo";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "Brand kit",
  description: "ShipOrSkip logos, colors, type and voice. Download the logo and mark in SVG and PNG.",
  alternates: { canonical: "/brand" },
};

const COLORS: { name: string; hex: string; use: string }[] = [
  { name: "Ink", hex: "#202122", use: "Text, the mark" },
  { name: "Link blue", hex: "#3366CC", use: "Links and primary buttons" },
  { name: "Deep blue", hex: "#2A4B8D", use: "Pressed buttons, link hover" },
  { name: "Paper", hex: "#FFFFFF", use: "Page background" },
  { name: "Surface", hex: "#F8F9FA", use: "Boxes, tables, secondary buttons" },
  { name: "Rule", hex: "#A2A9B1", use: "Borders and heading rules" },
];

const FILES: [string, string][] = [
  ["Logo (SVG)", "/brand/shiporskip-logo.svg"],
  ["Logo (PNG)", "/brand/shiporskip-logo.png"],
  ["Logo on dark (SVG)", "/brand/shiporskip-logo-white.svg"],
  ["Logo on dark (PNG)", "/brand/shiporskip-logo-white.png"],
  ["Mark (SVG)", "/brand/shiporskip-mark.svg"],
  ["Mark (PNG, 1024px)", "/brand/shiporskip-mark-1024.png"],
  ["Wordmark (SVG)", "/brand/shiporskip-wordmark.svg"],
];

const VOICE: [string, string, string][] = [
  ["Plain", "Pick the one you’d ship.", "Please consider voting on your preferred project."],
  ["Builder to builder", "Half-built repos welcome.", "Submit your early-stage ventures."],
  ["Honest", "No votes yet. Share the link.", "Your campaign is performing great!"],
];

const h2 = "wiki-rule mt-7 mb-3 text-[24px]";

export default function BrandPage() {
  return (
    <div className="max-w-[820px] text-[15px]">
      <PageHeader title="Brand kit">
        Logos, colors, type and voice. Writing about ShipOrSkip or making something with it? Use these. The look is deliberately plain: a reference work, not an ad.
      </PageHeader>

      <h2 className={h2}>Logo</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid min-h-[140px] place-items-center border border-border bg-white p-6">
          <Logo size="lg" tagline />
        </div>
        <div className="grid min-h-[140px] place-items-center border border-border bg-ink p-6">
          <Logo size="lg" tone="dark" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-5 border border-border bg-fill-2 p-4">
        <Mark size={64} />
        <Mark size={32} />
        <Mark size={16} />
        <p className="m-0 text-[14px] text-muted-2">
          The mark is an upvote resting on a finish line. Give the logo room on every side, at least the height of the mark. Don’t recolor, stretch or outline it.
        </p>
      </div>
      <p className="mb-1 font-bold">Downloads</p>
      <ul className="m-0 columns-1 pl-6 sm:columns-2">
        {FILES.map(([label, href]) => (
          <li key={href}>
            <a href={href} download>{label}</a>
          </li>
        ))}
      </ul>

      <h2 className={h2}>Tagline</h2>
      <table className="wikitable">
        <tbody className="bg-white">
          <tr>
            <th className="w-[120px]">Primary</th>
            <td>
              <span className="font-serif text-[22px]">Builders vote. You ship.</span>
              <div className="text-[13px] text-muted-2">Headlines, bios, share cards and pitches.</div>
            </td>
          </tr>
          <tr>
            <th>Secondary</th>
            <td>
              <span className="font-serif text-[18px]">Ship it or skip it.</span>
              <div className="text-[13px] text-muted-2">Calls to action and sign-offs.</div>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className={h2}>Name</h2>
      <p className="m-0">
        One word, three capitals: <b>ShipOrSkip</b>. Not “Ship or Skip”, “Shiporskip” or “SOS”. The lowercase <code className="bg-fill-2 px-1">shiporskip</code> is for URLs and
        handles only.
      </p>

      <h2 className={h2}>Color</h2>
      <table className="wikitable text-[14px]">
        <thead>
          <tr>
            <th className="w-[64px]">Swatch</th>
            <th>Name</th>
            <th>Hex</th>
            <th className="max-sm:hidden">Used for</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {COLORS.map((c) => (
            <tr key={c.hex}>
              <td>
                <span className="block h-6 w-10 border border-border" style={{ background: c.hex }} />
              </td>
              <td className="font-bold">{c.name}</td>
              <td className="font-mono">{c.hex}</td>
              <td className="text-muted-2 max-sm:hidden">{c.use}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className={h2}>Type</h2>
      <table className="wikitable text-[14px]">
        <tbody className="bg-white">
          <tr>
            <th className="w-[120px]">Headings</th>
            <td>
              <span className="font-serif text-[26px]">Libertinus Serif</span>
              <div className="text-[13px] text-muted-2">Regular weight, with a hairline rule under page and section titles.</div>
            </td>
          </tr>
          <tr>
            <th>Body</th>
            <td>
              <span className="text-[18px]">System sans-serif</span>
              <div className="text-[13px] text-muted-2">The reader’s own UI font: San Francisco, Segoe UI, Roboto.</div>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className={h2}>Voice</h2>
      <table className="wikitable text-[14px]">
        <thead>
          <tr>
            <th>Trait</th>
            <th>Write</th>
            <th>Not</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {VOICE.map(([trait, yes, no]) => (
            <tr key={trait}>
              <td className="font-bold">{trait}</td>
              <td>{yes}</td>
              <td className="text-muted-3 line-through">{no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
