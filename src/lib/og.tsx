import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isOurImageUrl } from "./upload";

export const OG_SIZE = { width: 1200, height: 630 };

type Font = { name: string; data: Buffer; weight: 400 | 700; style: "normal" };
let fonts: Promise<Font[]> | null = null;

/** Geist (OFL) — the default OG font has no bold weight. */
export function ogFonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  fonts ??= Promise.all([
    readFile(path.join(dir, "Geist-Regular.ttf")).then((data): Font => ({ name: "Geist", data, weight: 400, style: "normal" })),
    readFile(path.join(dir, "Geist-Bold.ttf")).then((data): Font => ({ name: "Geist", data, weight: 700, style: "normal" })),
    readFile(path.join(dir, "GeistMono-Bold.ttf")).then((data): Font => ({ name: "Geist Mono", data, weight: 700, style: "normal" })),
  ]);
  return fonts;
}

/** Options for every ImageResponse: size plus fonts. */
export async function ogOptions() {
  return { ...OG_SIZE, fonts: await ogFonts() };
}

const C = { ink: "#1a1a1a", bg: "#fafaf8", border: "#e6e6e2", fill: "#f0f0ec", muted: "#6b6b66", faint: "#b5b5ae", green: "#2f7a4a", tint: "#e7f4ec", greenText: "#1f5c36" };
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
      <rect width="32" height="32" rx="8" fill={C.green} />
      <path d="M9 18.5 16 11.5l7 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 23.5h11" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function Brand({ size = 30 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Mark size={size + 14} />
      <div style={{ fontSize: size, fontWeight: 700, color: C.ink, fontFamily: "Geist Mono" }}>shiporskip</div>
    </div>
  );
}

/** A project image, or its initial on a fill when there's no usable image. */
export function Thumb({ src, name, width, height, radius = 16, fontSize = 64 }: { src: string | null; name: string; width: number; height: number; radius?: number; fontSize?: number }) {
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={width} height={height} style={{ width, height, borderRadius: radius, objectFit: "cover" }} />;
  return (
    <div style={{ width, height, borderRadius: radius, background: C.fill, display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 700, color: C.faint }}>
      {(name[0] || "?").toUpperCase()}
    </div>
  );
}

export const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
