import { Logo, Mark, Wordmark } from "@/components/Logo";
import { PageHeader } from "@/components/PageHeader";
import { Eyebrow } from "@/components/SiteFooter";

export const metadata = {
  title: "Brand kit",
  description: "ShipOrSkip logos, colors, type and voice. Download the logo and mark in SVG and PNG.",
  alternates: { canonical: "/brand" },
};

const COLORS: { name: string; hex: string; use: string }[] = [
  { name: "Forest", hex: "#336021", use: "Ship. Primary actions, the mark, progress" },
  { name: "Ember", hex: "#E68C3A", use: "The “Or”, highlights, accents on dark" },
  { name: "Charcoal", hex: "#272525", use: "Text and dark surfaces" },
  { name: "Paper", hex: "#F4F2EF", use: "Page background" },
  { name: "Moss", hex: "#E6EDDF", use: "Green tints, selected states" },
  { name: "Apricot", hex: "#FBE9D7", use: "Orange tints, boosts" },
];

const FILES: [string, string][] = [
  ["Logo · SVG", "/brand/shiporskip-logo.svg"],
  ["Logo · PNG", "/brand/shiporskip-logo.png"],
  ["Logo on dark · SVG", "/brand/shiporskip-logo-white.svg"],
  ["Logo on dark · PNG", "/brand/shiporskip-logo-white.png"],
  ["Mark · SVG", "/brand/shiporskip-mark.svg"],
  ["Mark · PNG 1024", "/brand/shiporskip-mark-1024.png"],
  ["Wordmark · SVG", "/brand/shiporskip-wordmark.svg"],
];

const VOICE: [string, string, string][] = [
  ["Direct", "Pick the one you’d ship.", "Please consider voting on your preferred project."],
  ["Builder to builder", "Half-built repos welcome.", "Submit your early-stage ventures."],
  ["Honest", "No votes yet. Share it.", "Your campaign is performing great!"],
];

const card = "rounded-[10px] border border-border bg-white";

export default function BrandPage() {
  return (
    <div className="max-w-[760px]">
      <PageHeader eyebrow="Brand kit" title="Builders vote. You ship.">
        Logos, colors, type and voice. Writing about us or making something with us? Use these.
      </PageHeader>

      <Eyebrow className="mt-8 mb-3">Logo</Eyebrow>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`${card} grid min-h-[150px] place-items-center p-6`}>
          <Logo size="lg" />
        </div>
        <div className="grid min-h-[150px] place-items-center rounded-[10px] bg-ink p-6">
          <Logo size="lg" tone="dark" />
        </div>
        <div className={`${card} flex min-h-[150px] items-center justify-center gap-6 p-6`}>
          <Mark size={72} />
          <Mark size={40} />
          <Mark size={24} />
        </div>
        <div className={`${card} flex min-h-[150px] flex-col justify-center gap-2 p-6 text-[15px] text-muted-2`}>
          <p className="m-0">
            The mark is an upvote over an ember finish line. The orange <b className="text-orange-text">Or</b> is the decision.
          </p>
          <p className="m-0">Give the logo room: at least the mark’s height on every side. Don’t recolor, stretch or outline it.</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {FILES.map(([label, href]) => (
          <a key={href} href={href} download className="rounded-md border border-outline bg-white px-3 py-1.5 font-mono text-xs font-semibold no-underline hover:border-green">
            ↓ {label}
          </a>
        ))}
      </div>

      <Eyebrow className="mt-10 mb-3">Tagline</Eyebrow>
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[10px] bg-ink p-6 text-white">
          <div className="text-[34px] leading-none font-bold tracking-[-.045em]">
            Builders vote. <span className="text-orange">You ship.</span>
          </div>
          <div className="mt-3 text-[14px] text-faint">Primary. Use it in headlines, bios, share cards and pitches.</div>
        </div>
        <div className={`${card} flex flex-col justify-center p-6`}>
          <div className="text-[22px] leading-none font-bold tracking-[-.03em]">Ship it or skip it.</div>
          <div className="mt-3 text-[14px] text-muted-2">Secondary. Calls to action and sign-offs.</div>
        </div>
      </div>

      <Eyebrow className="mt-10 mb-3">Name</Eyebrow>
      <div className={`${card} p-4 text-[15px]`}>
        <p className="m-0 mb-2">
          One word, three capitals: <Wordmark className="text-base" />. In running text, write <b>ShipOrSkip</b>.
        </p>
        <p className="m-0 text-muted-2">Not “Ship or Skip”, “Shiporskip” or “SOS”. The lowercase <span className="font-mono">shiporskip</span> is for URLs and handles only.</p>
      </div>

      <Eyebrow className="mt-10 mb-3">Color</Eyebrow>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {COLORS.map((c) => (
          <div key={c.hex} className={`${card} overflow-hidden`}>
            <div className="h-20 border-b border-border" style={{ background: c.hex }} />
            <div className="p-3">
              <div className="font-semibold">{c.name}</div>
              <div className="font-mono text-xs text-muted-2">{c.hex}</div>
              <div className="mt-1 text-[13px] text-muted-3">{c.use}</div>
            </div>
          </div>
        ))}
      </div>

      <Eyebrow className="mt-10 mb-3">Type</Eyebrow>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`${card} p-5`}>
          <div className="text-[40px] leading-none font-bold tracking-[-.035em]">Aa</div>
          <div className="mt-3 font-semibold">Geist</div>
          <div className="text-[13px] text-muted-2">Headlines bold, tight tracking. Body regular.</div>
        </div>
        <div className={`${card} p-5`}>
          <div className="font-mono text-[40px] leading-none font-bold">01</div>
          <div className="mt-3 font-semibold">Geist Mono</div>
          <div className="text-[13px] text-muted-2">Numbers, timers, labels. Anything you’d count.</div>
        </div>
      </div>

      <Eyebrow className="mt-10 mb-3">Voice</Eyebrow>
      <div className={`${card} overflow-hidden`}>
        {VOICE.map(([trait, yes, no], i) => (
          <div key={trait} className={`grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr_1fr] sm:gap-4 ${i ? "border-t border-divider" : ""}`}>
            <span className="font-semibold">{trait}</span>
            <span className="text-[15px]"><span className="font-bold text-green">✓</span> {yes}</span>
            <span className="text-[15px] text-muted-3 line-through decoration-muted-3/50">{no}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
