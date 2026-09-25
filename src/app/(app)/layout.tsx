import { AppShell } from "@/components/AppShell";
import { getUser, publicUser } from "@/lib/auth";
import { mockMode } from "@/lib/github";
import { getTopBuilders } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, topBuilders] = await Promise.all([getUser(), getTopBuilders()]);
  return (
    <AppShell user={publicUser(user)} topBuilders={topBuilders} githubMock={mockMode()}>
      {children}
    </AppShell>
  );
}
