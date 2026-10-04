import { ImageResponse } from "next/og";
import { appUrl } from "@/lib/config";
import { closesLabel } from "@/lib/format";
import { Backdrop, BrandDark, clamp, D, host, ogImage, ogOptions, OG_SIZE, Pill, Thumb } from "@/lib/og";
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
  const n = Math.max(projects.length, 1);
  const gap = 18;
  const w = Math.floor((1200 - 128 - gap * (n - 1)) / n);
  const h = Math.min(Math.round((w * 9) / 16), 170);
  const open = c?.open ?? false;

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", background: D.bg, color: D.text, fontFamily: "Geist", padding: "48px 64px 44px", overflow: "hidden" }}>
        <Backdrop />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BrandDark size={26} />
          <Pill dot={open}>{open ? "VOTING LIVE" : "VOTE CLOSED"}</Pill>
        </div>

        <div style={{ position: "relative", display: "flex", marginTop: 34, fontSize: 20, fontFamily: "Geist Mono", fontWeight: 700, letterSpacing: 2, color: D.bright }}>SHIP OR SKIP?</div>
        <div style={{ position: "relative", display: "flex", marginTop: 10, fontSize: projects.length > 3 ? 54 : 60, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2.2, maxWidth: 1000 }}>
          {clamp(c?.title ?? "Which one should I finish?", 62)}
        </div>
        {c && (
          <div style={{ position: "relative", display: "flex", marginTop: 14, fontSize: 24, color: D.muted }}>
            {`@${c.handle} · ${c.total} vote${c.total === 1 ? "" : "s"} · ${closesLabel(c.closesAt)}`}
          </div>
        )}

        <div style={{ position: "relative", display: "flex", gap, marginTop: "auto" }}>
          {projects.map((p, i) => {
            const pct = total ? Math.round((p.votes / total) * 100) : 0;
            const leader = total > 0 && p.votes === lead;
            return (
              <div
                key={p.id}
                style={{ display: "flex", flexDirection: "column", width: w, background: "#fff", color: "#1a1a1a", borderRadius: 20, overflow: "hidden", border: `3px solid ${leader ? D.bright : "rgba(255,255,255,.0)"}`, boxShadow: "0 24px 48px -16px rgba(0,0,0,.6)" }}
              >
                <Thumb src={imgs[i]} name={p.name} width={w - 6} height={h} radius={0} fontSize={Math.round(h / 2.2)} />
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, display: "flex", background: leader ? "#d4ecdc" : "#f2f2ee" }} />
                  <div style={{ position: "relative", display: "flex", fontSize: n > 3 ? 22 : 28, fontWeight: 700, letterSpacing: -0.5 }}>{clamp(p.name, n > 3 ? 12 : 18)}</div>
                  <div style={{ position: "relative", display: "flex", fontSize: n > 3 ? 20 : 24, fontWeight: 700, fontFamily: "Geist Mono", color: leader ? D.green : "#6b6b66" }}>
                    {total ? `${pct}%` : "VOTE"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 20, fontFamily: "Geist Mono", color: D.faint }}>
          <span>{host(appUrl())}</span>
          <span style={{ color: D.bright }}>Cast your vote →</span>
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
