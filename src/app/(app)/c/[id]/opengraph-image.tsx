import { ImageResponse } from "next/og";
import { closesLabel } from "@/lib/format";
import { Brand, ogOptions, clamp, ogImage, OG_COLORS as C, OG_SIZE, Thumb } from "@/lib/og";
import { getCampaign } from "@/lib/queries";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vote on which side project gets finished";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCampaign((await params).id, null);
  const projects = (c?.projects ?? []).slice(0, 5);
  const imgs = await Promise.all(projects.map((p) => ogImage(p.imageUrl)));
  const n = Math.max(projects.length, 1);
  const gap = 20;
  const w = Math.floor((1200 - 112 - gap * (n - 1)) / n);
  const h = Math.min(Math.round((w * 3) / 4), 240);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, padding: 56, color: C.ink, fontFamily: "Geist" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Brand size={26} />
          {c && <div style={{ display: "flex", fontSize: 24, color: C.muted }}>{`@${c.handle} · ${c.total} votes · ${closesLabel(c.closesAt)}`}</div>}
        </div>
        <div style={{ display: "flex", fontSize: 52, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, marginTop: 28 }}>
          {clamp(c?.title ?? "Which one should I finish?", 70)}
        </div>
        <div style={{ display: "flex", gap, marginTop: "auto" }}>
          {projects.map((p, i) => (
            <div key={p.id} style={{ display: "flex", flexDirection: "column", width: w, background: "#fff", border: `2px solid ${C.border}`, borderRadius: 18, overflow: "hidden" }}>
              <Thumb src={imgs[i]} name={p.name} width={w - 4} height={h} radius={0} fontSize={Math.round(h / 2.4)} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
                <div style={{ display: "flex", fontSize: n > 3 ? 24 : 30, fontWeight: 700 }}>{clamp(p.name, n > 3 ? 14 : 20)}</div>
                <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: C.green, border: `2px solid ${C.green}`, borderRadius: 10, padding: "4px 12px" }}>Vote</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
