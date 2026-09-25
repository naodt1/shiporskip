import { ImageResponse } from "next/og";
import { Brand, ogOptions, clamp, ogImage, OG_COLORS as C, OG_SIZE, Thumb } from "@/lib/og";
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

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.bg, padding: 56, gap: 52, color: C.ink, fontFamily: "Geist" }}>
        <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 24, overflow: "hidden", alignSelf: "center" }}>
          <Thumb src={hero} name={p?.name ?? "?"} width={560} height={518} radius={0} fontSize={200} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Brand size={24} />
          <div style={{ display: "flex", marginTop: 40, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: C.green }}>VOTE TO SHIP</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 8 }}>{clamp(p?.name ?? "Project", 18)}</div>
          <div style={{ display: "flex", fontSize: 26, lineHeight: 1.3, color: C.muted, marginTop: 14 }}>{clamp(p?.oneliner ?? "", 90)}</div>
          {p?.offer && (
            <div style={{ display: "flex", marginTop: 18 }}>
              <div style={{ display: "flex", fontSize: 22, fontWeight: 700, background: C.tint, color: C.greenText, borderRadius: 8, padding: "4px 12px" }}>{clamp(p.offer, 36)}</div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 12 }}>
            {others.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", fontSize: 20, color: C.muted, marginRight: 6 }}>vs</div>
                {others.map((o, i) => (
                  <div key={o.id} style={{ display: "flex", border: "3px solid #fff", borderRadius: 12, marginLeft: i ? -18 : 0 }}>
                    <Thumb src={rest[i]} name={o.name} width={64} height={64} radius={10} fontSize={26} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", fontSize: 22, color: C.muted }}>{c ? clamp(`@${c.handle}: ${c.title}`, 60) : ""}</div>
          </div>
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
