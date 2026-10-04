/** Top of every app page, encyclopedia-style: serif title over a hairline rule, a "From ShipOrSkip" line, then the lede. */
export function PageHeader({ title, children, className = "" }: { title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-5 ${className}`}>
      <h1 className="wiki-rule m-0 text-[28.8px] leading-[1.3]">{title}</h1>
      <div className="mt-1 text-[13px] text-muted-2">From ShipOrSkip, where builders vote and you ship</div>
      {children && <p className="m-0 mt-3 max-w-[720px] text-[15px] text-pretty text-ink">{children}</p>}
    </div>
  );
}
