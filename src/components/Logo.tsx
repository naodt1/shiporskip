// Brand marks. Same geometry as src/app/icon.svg, public/brand/* and the OG images (src/lib/og.tsx).

export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="6" fill="var(--color-ink)" />
      <path d="M9 18.5 16 11.5l7 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 23.5h11" stroke="#a2a9b1" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/** Serif wordmark. */
export function Wordmark({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  return <span className={`font-serif whitespace-nowrap ${tone === "dark" ? "text-white" : "text-ink"} ${className}`}>ShipOrSkip</span>;
}

const SIZES = {
  sm: { mark: 24, text: "text-[19px]", gap: "gap-2" },
  md: { mark: 32, text: "text-[23px]", gap: "gap-2.5" },
  lg: { mark: 44, text: "text-[32px]", gap: "gap-3" },
};

/** Mark + wordmark, with the tagline underneath when `tagline` is set (masthead style). */
export function Logo({ size = "md", tone = "light", tagline = false, className = "" }: { size?: keyof typeof SIZES; tone?: "light" | "dark"; tagline?: boolean; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <Mark size={s.mark} />
      <span className="flex flex-col">
        <Wordmark tone={tone} className={`${s.text} leading-none`} />
        {tagline && <span className="mt-1 font-serif text-[12.5px] leading-none text-muted-2 italic">Builders vote. You ship.</span>}
      </span>
    </span>
  );
}
