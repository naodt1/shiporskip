import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { appUrl } from "@/lib/config";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Render per request: the database isn't reachable at build time.
  await connection();
  const base = appUrl();
  const now = new Date();
  const campaigns = await db.campaign.findMany({
    select: { id: true, createdAt: true, closesAt: true, status: true, projects: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });
  return [
    { url: base, changeFrequency: "daily", priority: 1, lastModified: now },
    { url: `${base}/feed`, changeFrequency: "hourly", priority: 0.9, lastModified: now },
    { url: `${base}/feed?sort=new`, changeFrequency: "hourly", priority: 0.6 },
    { url: `${base}/feed?sort=ending`, changeFrequency: "hourly", priority: 0.6 },
    { url: `${base}/leaderboards`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    ...campaigns.flatMap((c) => {
      const open = c.status === "open" && c.closesAt > now;
      const entry = { lastModified: open ? now : c.closesAt, changeFrequency: open ? ("hourly" as const) : ("monthly" as const) };
      return [
        { url: `${base}/c/${c.id}`, priority: open ? 0.8 : 0.5, ...entry },
        ...c.projects.map((p) => ({ url: `${base}/c/${c.id}/p/${p.id}`, priority: open ? 0.5 : 0.3, ...entry })),
      ];
    }),
  ];
}
