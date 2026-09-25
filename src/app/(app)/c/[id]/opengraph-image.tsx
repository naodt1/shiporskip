import { ImageResponse } from "next/og";
import { appUrl } from "@/lib/config";
import { getCampaign } from "@/lib/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ShipOrSkip campaign";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCampaign((await params).id, null);
  const abs = (u: string) => (u.startsWith("/") ? appUrl() + u : u);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fafaf8", padding: 64, fontFamily: "sans-serif", color: "#1a1a1a" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#2f7a4a" }}>shiporskip</div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, marginTop: 24, maxWidth: 1000 }}>{c?.title ?? "Which one should I finish?"}</div>
        <div style={{ fontSize: 28, color: "#6b6b66", marginTop: 16 }}>{c ? `@${c.handle} · ${c.projects.length} projects · vote on the one to finish` : ""}</div>
        <div style={{ display: "flex", gap: 20, marginTop: "auto" }}>
          {(c?.projects ?? []).slice(0, 5).map((p) =>
            p.imageUrl ? (
               
              <img key={p.id} src={abs(p.imageUrl)} alt="" width={180} height={135} style={{ borderRadius: 16, objectFit: "cover", border: "1px solid #e6e6e2" }} />
            ) : (
              <div key={p.id} style={{ width: 180, height: 135, borderRadius: 16, background: "#f0f0ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#55554f", border: "1px solid #e6e6e2" }}>
                {p.name}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
