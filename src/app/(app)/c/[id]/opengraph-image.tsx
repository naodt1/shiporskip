import { ImageResponse } from "next/og";
import { appUrl } from "@/lib/config";
import { closesLabel } from "@/lib/format";
import { Brand, clamp, host, ogImage, ogOptions, OG_COLORS as C, OG_SIZE, Thumb, Title } from "@/lib/og";
import { getCampaign } from "@/lib/queries";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vote on which side project gets finished";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCampaign((await params).id, null);
  const projects = (c?.projects ?? []).slice(0, 5);
  const imgs = await Promise.all(projects.map((p) => ogImage(p.imageUrl)));
  const total = projects.reduce((a, p) => a + p.votes, 0);
  const lead = Math.max(0, ...projects.map((p) => p.votes));
  const rowH = projects.length > 3 ? 62 : 76;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.ink, fontFamily: "Geist", padding: "36px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Brand size={24} />
          <div style={{ display: "flex", fontSize: 20, color: C.faint }}>{host(appUrl())}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
          <Title size={52}>{clamp(c?.title ?? "Which one should I finish?", 52)}</Title>
          <div style={{ display: "flex", fontSize: 21, color: C.muted, marginTop: 8 }}>
            {c ? `A campaign by @${c.handle} · ${c.total} vote${c.total === 1 ? "" : "s"} · ${closesLabel(c.closesAt)}` : "A ShipOrSkip campaign"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", border: `2px solid ${C.border}`, background: "#fff" }}>
          <div style={{ display: "flex", background: C.head, borderBottom: `2px solid ${C.border}`, fontSize: 20, fontWeight: 700, padding: "8px 16px" }}>
            <div style={{ display: "flex", flex: 1 }}>Project</div>
            <div style={{ display: "flex", width: 120, justifyContent: "flex-end" }}>Votes</div>
          </div>
          {projects.map((p, i) => {
            const pct = total ? Math.round((p.votes / total) * 100) : 0;
            const leader = total > 0 && p.votes === lead;
            return (
              <div key={p.id} style={{ position: "relative", display: "flex", alignItems: "center", height: rowH, padding: "0 16px", gap: 16, borderTop: i ? `1px solid ${C.divider}` : "none" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, display: "flex", background: leader ? C.tint : C.surface }} />
                <Thumb src={imgs[i]} name={p.name} width={rowH - 18} height={rowH - 18} radius={2} fontSize={Math.round(rowH / 2.4)} />
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", fontSize: 25, color: C.link, fontWeight: leader ? 700 : 400 }}>{clamp(p.name, 28)}</div>
                  {rowH > 70 && <div style={{ display: "flex", fontSize: 18, color: C.muted }}>{clamp(p.oneliner, 70)}</div>}
                </div>
                <div style={{ display: "flex", width: 120, justifyContent: "flex-end", fontSize: 25, fontWeight: 700 }}>{total ? `${pct}%` : "–"}</div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
