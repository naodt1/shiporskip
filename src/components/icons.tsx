type P = { size?: number; className?: string };
const stroke = (size = 16, sw = 1.5) => ({
  width: size,
  height: size,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Flame = ({ size, className }: P) => (
  <svg {...stroke(size)} className={className}><path d="M8 1.5c.5 2.5 3.5 4 3.5 7.5a3.5 3.5 0 0 1-7 0c0-1.5.7-2.5 1.5-3.2.2 1.2.8 1.9 1.5 2.2C7 6 7 3.8 8 1.5Z" /></svg>
);
export const Plus = ({ size, className }: P) => (
  <svg {...stroke(size)} className={className}><path d="M8 2v12M2 8h12" /></svg>
);
export const Clock = ({ size, className }: P) => (
  <svg {...stroke(size, size && size < 16 ? 1.6 : 1.5)} className={className}><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" /></svg>
);
export const Trophy = ({ size, className }: P) => (
  <svg {...stroke(size)} className={className}><path d="M5 2.5h6v3a3 3 0 0 1-6 0v-3ZM5 4H2.5a2 2 0 0 0 2.5 2M11 4h2.5a2 2 0 0 1-2.5 2M8 8.5V11M5.5 13.5h5L10 11H6l-.5 2.5Z" /></svg>
);
export const Grid = ({ size, className }: P) => (
  <svg {...stroke(size)} className={className}>
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
export const Info = ({ size, className }: P) => (
  <svg {...stroke(size)} className={className}><circle cx="8" cy="8" r="6" /><path d="M8 7.5V11M8 5h.01" /></svg>
);
export const ArrowUp = ({ size, className }: P) => (
  <svg {...stroke(size, 1.6)} className={className}><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
);
export const ChevronUp = ({ size, className }: P) => (
  <svg {...stroke(size, 1.8)} className={className}><path d="M3.5 10 8 5l4.5 5" /></svg>
);
export const LinkIcon = ({ size, className }: P) => (
  <svg {...stroke(size, 1.6)} className={className}><path d="M6.5 9.5a3 3 0 0 0 4.2 0l2.3-2.3a3 3 0 0 0-4.2-4.2l-.8.8M9.5 6.5a3 3 0 0 0-4.2 0L3 8.8a3 3 0 0 0 4.2 4.2l.8-.8" /></svg>
);
export const GitHubMark = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
    <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
  </svg>
);
