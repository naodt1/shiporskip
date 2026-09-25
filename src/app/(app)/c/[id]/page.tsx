import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignView } from "@/components/CampaignView";
import { getUser } from "@/lib/auth";
import { getCampaign } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/c/[id]">): Promise<Metadata> {
  const c = await getCampaign((await params).id, null);
  if (!c) return { title: "Campaign not found", robots: { index: false } };
  const description = `Help @${c.handle} pick which side project to finish: ${c.projects.map((p) => p.name).join(" vs ")}. ${c.total} votes so far.`;
  return {
    title: c.title,
    description,
    alternates: { canonical: `/c/${c.id}` },
    openGraph: { title: c.title, description, type: "website", url: `/c/${c.id}` },
    twitter: { card: "summary_large_image", title: c.title, description },
  };
}

export default async function CampaignPage({ params }: PageProps<"/c/[id]">) {
  const user = await getUser();
  const c = await getCampaign((await params).id, user?.id ?? null);
  if (!c) notFound();
  return <CampaignView c={c} />;
}
