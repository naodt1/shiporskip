import { ImageResponse } from "next/og";
import { appUrl } from "@/lib/config";
import { Backdrop, BrandDark, D, host, ogOptions, OG_SIZE, Pill } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "ShipOrSkip: Builders vote. You ship.";

const DEMO: { name: string; pct: number; color: string }[] = [
  { name: "tallyho", pct: 52, color: "#336021" },
  { name: "quietcal", pct: 31, color: "#e68c3a" },
  { name: "plotline", pct: 17, color: "#3a3737" },
];

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: D.bg, color: D.text, fontFamily: "Geist", overflow: "hidden" }}>
        <Backdrop />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: 640, padding: "56px 0 52px 64px" }}>
          <BrandDark size={30} />
          <div style={{ display: "flex", flexDirection: "column", marginTop: 54, fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: -4.5 }}>
            <div style={{ display: "flex" }}>Builders vote.</div>
            <div style={{ display: "flex", color: D.accent }}>You ship.</div>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.3, color: D.muted, maxWidth: 520 }}>
            Post your half-built side projects. Builders pick the one worth finishing.
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 22, fontFamily: "Geist Mono", color: D.faint }}>{host(appUrl())}</div>
        </div>

        {/* Tilted campaign card */}
        <div style={{ position: "relative", display: "flex", flex: 1, alignItems: "center", justifyContent: "center", paddingRight: 40 }}>
          <div style={{ position: "absolute", display: "flex", width: 440, height: 400, borderRadius: 28, background: "rgba(255,255,255,.05)", border: `1.5px solid ${D.line}`, transform: "rotate(6deg) translate(26px, 10px)" }} />
          <div
            style={{
              display: "flex", flexDirection: "column", width: 460, padding: 30, borderRadius: 28, background: "#ffffff", color: "#272525",
              transform: "rotate(-3deg)", boxShadow: "0 40px 80px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, color: "#6d6863" }}>
              <div style={{ display: "flex", width: 30, height: 30, borderRadius: 999, background: "#b4532a", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>M</div>
              @mara
              <div style={{ display: "flex", marginLeft: "auto", alignItems: "center", gap: 8, fontFamily: "Geist Mono", fontWeight: 700, fontSize: 16, color: D.green, letterSpacing: 1 }}>
                <div style={{ display: "flex", width: 9, height: 9, borderRadius: 999, background: D.green }} />
                LIVE
              </div>
            </div>
            <div style={{ display: "flex", marginTop: 12, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15 }}>Three half-built things, one free weekend</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
              {DEMO.map((r, i) => (
                <div key={r.name} style={{ position: "relative", display: "flex", alignItems: "center", height: 62, borderRadius: 16, border: `2px solid ${i === 0 ? D.green : "#e3dfd9"}`, overflow: "hidden", padding: "0 16px", gap: 14 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.pct}%`, display: "flex", background: i === 0 ? "#d3e0c8" : "#efece8" }} />
                  <div style={{ display: "flex", width: 34, height: 34, borderRadius: 9, background: r.color, color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>{r.name[0].toUpperCase()}</div>
                  <div style={{ display: "flex", flex: 1, fontSize: 23, fontWeight: 700 }}>{r.name}</div>
                  {i === 0 && <div style={{ display: "flex", fontSize: 16, fontWeight: 700, color: D.green, marginRight: 10 }}>YOUR PICK</div>}
                  <div style={{ display: "flex", fontSize: 23, fontWeight: 700, fontFamily: "Geist Mono" }}>{r.pct}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", display: "flex", top: 74, right: 52, transform: "rotate(4deg)" }}>
            <Pill tone="green">+1 SHIP</Pill>
          </div>
          <div style={{ position: "absolute", display: "flex", bottom: 70, left: 18, transform: "rotate(-4deg)" }}>
            <Pill dot>VERDICT IN 3 DAYS</Pill>
          </div>
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
