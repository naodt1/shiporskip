import { ImageResponse } from "next/og";
import { Brand, ogOptions, OG_COLORS as C, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "ShipOrSkip: let builders pick which side project you finish";

const DEMO: [string, number][] = [["tallyho", 45], ["quietcal", 36], ["plotline", 19]];

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.bg, padding: 64, gap: 56, color: C.ink, fontFamily: "Geist" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Brand />
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, marginTop: 56 }}>Stop starting. Let builders pick the one you finish.</div>
          <div style={{ display: "flex", fontSize: 28, color: C.muted, marginTop: 24 }}>Post 2–5 unfinished GitHub projects. The community votes. You ship the winner.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, width: 420 }}>
          {DEMO.map(([name, pct], i) => (
            <div key={name} style={{ display: "flex", position: "relative", alignItems: "center", height: 84, background: "#fff", border: `2px solid ${i === 0 ? C.green : C.border}`, borderRadius: 14, overflow: "hidden", padding: "0 24px" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: i === 0 ? "#d4ecdc" : "#f4f4f0" }} />
              <div style={{ display: "flex", flex: 1, fontSize: 30, fontWeight: 700 }}>{name}</div>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>{pct}%</div>
            </div>
          ))}
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
