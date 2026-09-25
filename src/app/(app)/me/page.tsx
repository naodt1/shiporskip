import { LoginPrompt } from "@/components/LoginPrompt";
import { MyProjects } from "@/components/MyProjects";
import { getUser } from "@/lib/auth";
import { getMyCampaigns } from "@/lib/queries";

export const metadata = { title: "My projects · ShipOrSkip" };

export default async function MePage({ searchParams }: PageProps<"/me">) {
  const user = await getUser();
  if (!user) return <LoginPrompt reason="Log in to see your projects." />;
  const campaigns = await getMyCampaigns(user.id);
  const sel = (await searchParams).c;
  return <MyProjects campaigns={campaigns} selectedId={typeof sel === "string" ? sel : undefined} />;
}
