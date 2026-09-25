import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignView } from "@/components/CampaignView";
import { getUser } from "@/lib/auth";
import { getCampaign } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/c/[id]/p/[pid]">): Promise<Metadata> {
  const { id, pid } = await params;
  const c = await getCampaign(id, null);
  const p = c?.projects.find((x) => x.id === pid);
  if (!c || !p) return { title: "Project not found", robots: { index: false } };
  const title = `Vote for ${p.name}`;
  const description = `${p.oneliner}. @${c.handle} is choosing which side project to finish: ${c.projects.map((x) => x.name).join(" vs ")}.`;
  return {
    title,
    description,
    alternates: { canonical: `/c/${id}/p/${pid}` },
    openGraph: { title, description, type: "website", url: `/c/${id}/p/${pid}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectSharePage({ params }: PageProps<"/c/[id]/p/[pid]">) {
  const { id, pid } = await params;
  const user = await getUser();
  const c = await getCampaign(id, user?.id ?? null);
  if (!c || !c.projects.some((p) => p.id === pid)) notFound();
  return <CampaignView c={c} focusId={pid} />;
}
