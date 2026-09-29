// Brand marks. Same geometry as src/app/icon.svg, public/brand/* and the OG images (src/lib/og.tsx).

export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="8" fill="var(--color-green)" />
      <path d="M9 18.5 16 11.5l7 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 23.5h11" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

/** "Ship·Or·Skip": the green "Or" is the decision the product is about. */
export function Wordmark({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={`font-bold tracking-[-.035em] whitespace-nowrap ${tone === "dark" ? "text-white" : "text-ink"} ${className}`}>
      Ship<span className={tone === "dark" ? "text-green-bright" : "text-green"}>Or</span>Skip
    </span>
  );
}

const SIZES = { sm: { mark: 22, text: "text-[16px]", gap: "gap-2" }, md: { mark: 26, text: "text-[19px]", gap: "gap-2.5" }, lg: { mark: 36, text: "text-[26px]", gap: "gap-3" } };

/** Mark + wordmark lockup. */
export function Logo({ size = "md", tone = "light", className = "" }: { size?: keyof typeof SIZES; tone?: "light" | "dark"; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <Mark size={s.mark} />
      <Wordmark tone={tone} className={`${s.text} leading-none`} />
    </span>
  );
}
