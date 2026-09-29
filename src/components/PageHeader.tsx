import { Eyebrow } from "./SiteFooter";

/** Consistent top of every app page: eyebrow, title, optional one-line description. */
export function PageHeader({ eyebrow, title, children, className = "" }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      <Eyebrow tone="green" className="mb-1.5">{eyebrow}</Eyebrow>
      <h1 className="m-0 text-2xl leading-tight font-bold tracking-[-.025em]">{title}</h1>
      {children && <p className="m-0 mt-1.5 max-w-[560px] text-[15px] text-pretty text-muted-2">{children}</p>}
    </div>
  );
}
