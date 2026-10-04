import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TILE_TEXT, tileColors } from "./tiles";
import { isOurImageUrl } from "./upload";

export const OG_SIZE = { width: 1200, height: 630 };

type Font = { name: string; data: Buffer; weight: 400 | 700; style: "normal" };
let fonts: Promise<Font[]> | null = null;

/** Libertinus Serif for headings, Geist for body text (both OFL). */
export function ogFonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const load = (file: string, name: string, weight: 400 | 700): Promise<Font> => readFile(path.join(dir, file)).then((data) => ({ name, data, weight, style: "normal" }));
  fonts ??= Promise.all([
    load("LibertinusSerif-Regular.woff", "Libertinus", 400),
    load("LibertinusSerif-Bold.woff", "Libertinus", 700),
    load("Geist-Regular.ttf", "Geist", 400),
    load("Geist-Bold.ttf", "Geist", 700),
  ]);
  return fonts;
}

/** Options for every ImageResponse: size plus fonts. */
export async function ogOptions() {
  return { ...OG_SIZE, fonts: await ogFonts() };
}

/** Encyclopedia palette (Wikimedia Codex values). */
const C = { ink: "#202122", bg: "#ffffff", surface: "#f8f9fa", head: "#eaecf0", border: "#a2a9b1", divider: "#eaecf0", muted: "#54595d", faint: "#72777d", link: "#3366cc", tint: "#eaf3ff" };
export { C as OG_COLORS };

/** Satori renders PNG, JPEG and GIF. Returns a data URL, or null for anything else. */
export async function ogImage(url: string | null): Promise<string | null> {
  if (!url || !isOurImageUrl(url)) return null;
  try {
    let buf: Buffer;
    if (url.startsWith("/uploads/")) {
      buf = await readFile(path.join(process.cwd(), "public", url));
    } else {
      const res = await fetch(url);
      if (!res.ok) return null;
      buf = Buffer.from(await res.arrayBuffer());
    }
    const type =
      buf[0] === 0x89 && buf[1] === 0x50 ? "image/png" : buf[0] === 0xff && buf[1] === 0xd8 ? "image/jpeg" : buf.subarray(0, 3).toString() === "GIF" ? "image/gif" : null;
    return type ? `data:${type};base64,${buf.toString("base64")}` : null;
  } catch {
    return null;
  }
}

export function Mark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="6" fill={C.ink} />
      <path d="M9 18.5 16 11.5l7 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 23.5h11" stroke={C.border} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/** Masthead: mark, serif wordmark and the tagline in italics. */
export function Brand({ size = 30 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Mark size={size + 18} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: size + 4, fontFamily: "Libertinus", color: C.ink, lineHeight: 1 }}>ShipOrSkip</div>
        <div style={{ display: "flex", fontSize: Math.round(size * 0.55), fontFamily: "Libertinus", color: C.muted, marginTop: 4 }}>Builders vote. You ship.</div>
      </div>
    </div>
  );
}

/** Serif page title over a hairline rule. */
export function Title({ children, size = 64 }: { children: React.ReactNode; size?: number }) {
  return (
    <div style={{ display: "flex", fontFamily: "Libertinus", fontSize: size, lineHeight: 1.12, color: C.ink, borderBottom: `2px solid ${C.border}`, paddingBottom: 8 }}>{children}</div>
  );
}

/** A project image, or its initial on a colored tile when there's no usable image. */
export function Thumb({ src, name, width, height, radius = 16, fontSize = 64 }: { src: string | null; name: string; width: number; height: number; radius?: number; fontSize?: number }) {
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={width} height={height} style={{ width, height, borderRadius: radius, objectFit: "cover" }} />;
  const [from, to] = tileColors(name);
  return (
    <div style={{ width, height, borderRadius: radius, backgroundImage: `linear-gradient(135deg, ${from}, ${to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontFamily: "Libertinus", color: TILE_TEXT, border: `1px solid ${C.divider}` }}>
      {(name[0] || "?").toUpperCase()}
    </div>
  );
}

export const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

/** Public hostname for the footer of share cards. */
export const host = (url: string) => url.replace(/^https?:\/\//, "");
