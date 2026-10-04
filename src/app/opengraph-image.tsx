import { ImageResponse } from "next/og";
import { appUrl } from "@/lib/config";
import { Brand, host, ogOptions, OG_COLORS as C, OG_SIZE, Title } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "ShipOrSkip: Builders vote. You ship.";

const DEMO: [string, number][] = [
  ["tallyho", 52],
  ["quietcal", 31],
  ["plotline", 17],
];

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.ink, fontFamily: "Geist", padding: "44px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 22, borderBottom: `1px solid ${C.divider}` }}>
          <Brand size={30} />
          <div style={{ display: "flex", fontSize: 22, color: C.faint }}>{host(appUrl())}</div>
        </div>

        <div style={{ display: "flex", gap: 44, marginTop: 34, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Title size={66}>Builders vote. You ship.</Title>
            <div style={{ display: "flex", fontSize: 20, color: C.muted, marginTop: 8 }}>From ShipOrSkip, where builders vote and you ship</div>
            <div style={{ display: "flex", fontSize: 29, lineHeight: 1.45, marginTop: 22 }}>
              ShipOrSkip is where builders post their unfinished side projects and other builders vote on the one worth finishing. You get an answer, with reasons, in 3 days.
            </div>
          </div>

          {/* Infobox */}
          <div style={{ display: "flex", flexDirection: "column", width: 360, alignSelf: "flex-start", border: `2px solid ${C.border}`, background: C.surface, fontSize: 23 }}>
            <div style={{ display: "flex", justifyContent: "center", fontFamily: "Libertinus", fontWeight: 700, fontSize: 28, padding: "10px 0", background: C.head, borderBottom: `2px solid ${C.border}` }}>
              Example campaign
            </div>
            <div style={{ display: "flex", fontFamily: "Libertinus", fontSize: 24, padding: "12px 16px", background: "#fff", borderBottom: `1px solid ${C.border}` }}>
              Three half-built things, one free weekend
            </div>
            {DEMO.map(([name, pct], i) => (
              <div key={name} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#fff", borderBottom: `1px solid ${C.divider}` }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, display: "flex", background: i === 0 ? C.tint : C.surface }} />
                <div style={{ display: "flex", color: C.link, fontWeight: i === 0 ? 700 : 400 }}>{name}</div>
                <div style={{ display: "flex", fontWeight: 700 }}>{pct}%</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", fontSize: 19, color: C.muted }}>Vote closes in 3 days</div>
          </div>
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
