import { ImageResponse } from "next/og";
import { appUrl } from "@/lib/config";
import { Backdrop, BrandDark, clamp, D, host, ogImage, ogOptions, OG_SIZE, Pill, Thumb } from "@/lib/og";
import { getCampaign } from "@/lib/queries";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vote for this side project on ShipOrSkip";

export default async function Image({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = await params;
  const c = await getCampaign(id, null);
  const p = c?.projects.find((x) => x.id === pid);
  const others = (c?.projects ?? []).filter((x) => x.id !== pid).slice(0, 4);
  const [hero, ...rest] = await Promise.all([ogImage(p?.imageUrl ?? null), ...others.map((o) => ogImage(o.imageUrl))]);
  const total = (c?.projects ?? []).reduce((a, x) => a + x.votes, 0);
  const pct = p && total ? Math.round((p.votes / total) * 100) : null;

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: D.bg, color: D.text, fontFamily: "Geist", padding: 56, gap: 56, overflow: "hidden" }}>
        <Backdrop glow="bottom-left" />

        <div style={{ position: "relative", display: "flex", alignSelf: "center" }}>
          <div style={{ position: "absolute", top: 18, left: -14, display: "flex", width: 500, height: 480, borderRadius: 30, background: "rgba(255,255,255,.05)", border: `1.5px solid ${D.line}`, transform: "rotate(-5deg)" }} />
          <div style={{ display: "flex", borderRadius: 30, overflow: "hidden", border: "4px solid #ffffff", boxShadow: "0 40px 80px -20px rgba(0,0,0,.7)", transform: "rotate(2deg)" }}>
            <Thumb src={hero} name={p?.name ?? "?"} width={492} height={480} radius={0} fontSize={200} />
          </div>
          {pct != null && (
            <div style={{ position: "absolute", bottom: -14, right: -18, display: "flex", transform: "rotate(-4deg)" }}>
              <Pill tone="green">{`${pct}% OF VOTES`}</Pill>
            </div>
          )}
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1 }}>
          <BrandDark size={24} />
          <div style={{ display: "flex", marginTop: 44, fontSize: 20, fontFamily: "Geist Mono", fontWeight: 700, letterSpacing: 2, color: D.bright }}>VOTE TO SHIP</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: -3, marginTop: 10 }}>{clamp(p?.name ?? "Project", 14)}</div>
          <div style={{ display: "flex", fontSize: 27, lineHeight: 1.3, color: D.muted, marginTop: 16 }}>{clamp(p?.oneliner ?? "", 84)}</div>
          {p?.offer && (
            <div style={{ display: "flex", marginTop: 20 }}>
              <div style={{ display: "flex", fontSize: 21, fontWeight: 700, background: "rgba(127,209,155,.14)", color: D.bright, border: "1.5px solid rgba(127,209,155,.35)", borderRadius: 10, padding: "6px 14px" }}>
                {clamp(p.offer, 36)}
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 14 }}>
            {others.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", fontSize: 20, fontFamily: "Geist Mono", fontWeight: 700, color: D.faint, marginRight: 8 }}>VS</div>
                {others.map((o, i) => (
                  <div key={o.id} style={{ display: "flex", border: `3px solid ${D.bg}`, borderRadius: 14, marginLeft: i ? -16 : 0 }}>
                    <Thumb src={rest[i]} name={o.name} width={62} height={62} radius={11} fontSize={26} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", fontSize: 20, fontFamily: "Geist Mono", color: D.faint }}>{c ? clamp(`@${c.handle} · ${host(appUrl())}`, 52) : host(appUrl())}</div>
          </div>
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
