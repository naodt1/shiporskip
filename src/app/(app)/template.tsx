import { PageTransition } from "@/components/motion";

/** Re-mounts on every navigation inside the app, so each page fades in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
