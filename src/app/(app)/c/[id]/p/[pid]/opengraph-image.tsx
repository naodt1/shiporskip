import { ImageResponse } from "next/og";
import { appUrl } from "@/lib/config";
import { Brand, clamp, host, ogImage, ogOptions, OG_COLORS as C, OG_SIZE, Thumb, Title } from "@/lib/og";
import { getCampaign } from "@/lib/queries";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vote for this side project on ShipOrSkip";

export default async function Image({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = await params;
  const c = await getCampaign(id, null);
  const p = c?.projects.find((x) => x.id === pid);
  const hero = await ogImage(p?.imageUrl ?? null);
  const total = (c?.projects ?? []).reduce((a, x) => a + x.votes, 0);
  const pct = p && total ? `${Math.round((p.votes / total) * 100)}%` : "–";
  const others = (c?.projects ?? []).filter((x) => x.id !== pid).map((x) => x.name);

  const row = (k: string, v: string, link = false) => (
    <div style={{ display: "flex", borderTop: `1px solid ${C.divider}`, padding: "8px 14px", fontSize: 19 }}>
      <div style={{ display: "flex", width: 112, fontWeight: 700 }}>{k}</div>
      <div style={{ display: "flex", flex: 1, color: link ? C.link : C.ink }}>{v}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.bg, color: C.ink, fontFamily: "Geist", padding: "36px 60px", gap: 44 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Brand size={24} />
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
            <Title size={70}>{clamp(p?.name ?? "Project", 16)}</Title>
            <div style={{ display: "flex", fontSize: 20, color: C.muted, marginTop: 8 }}>{c ? `A project in @${c.handle}’s campaign` : "A ShipOrSkip project"}</div>
            <div style={{ display: "flex", fontSize: 30, lineHeight: 1.4, marginTop: 20 }}>{clamp(p?.oneliner ?? "", 90)}</div>
            {others.length > 0 && (
              <div style={{ display: "flex", fontSize: 22, color: C.muted, marginTop: 18 }}>{clamp(`Up against: ${others.join(", ")}`, 60)}</div>
            )}
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 20, color: C.faint }}>{host(appUrl())}</div>
        </div>

        {/* Infobox */}
        <div style={{ display: "flex", flexDirection: "column", width: 380, alignSelf: "center", border: `2px solid ${C.border}`, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "center", fontFamily: "Libertinus", fontWeight: 700, fontSize: 28, padding: "8px 0", background: C.head, borderBottom: `2px solid ${C.border}` }}>
            {clamp(p?.name ?? "Project", 18)}
          </div>
          <div style={{ display: "flex", padding: 8 }}>
            <Thumb src={hero} name={p?.name ?? "?"} width={360} height={240} radius={0} fontSize={110} />
          </div>
          {row("Votes", pct)}
          {p && row("Repo", clamp(p.repoFullName, 24), true)}
          {p && row("Commits", String(p.commits))}
          {p?.offer && row("Offer", clamp(p.offer, 24))}
        </div>
      </div>
    ),
    await ogOptions(),
  );
}
