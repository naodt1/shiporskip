"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { logout } from "@/app/actions";
import type { PublicUser } from "@/lib/auth";
import { AppContext, type AppCtx, type AuthMode } from "./AppContext";
import { AuthModal } from "./AuthModal";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";
import { PostPanel } from "./PostPanel";

type Builder = { id: string; handle: string; avatarUrl: string | null };

export function AppShell({ user, topBuilders, githubMock, children }: { user: PublicUser | null; topBuilders: Builder[]; githubMock: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState(user);
  const [auth, setAuth] = useState<{ mode: AuthMode; reason: string } | null>(null);
  const [postOpen, setPostOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const pending = useRef<(() => void) | null>(null);
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Server is the source of truth; follow it after refreshes.
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    setMe(user);
  }

  const toast = useCallback((t: string) => {
    setToastText(t);
    clearTimeout(tt.current);
    tt.current = setTimeout(() => setToastText(""), 2800);
  }, []);

  const gate = useCallback(
    (fn: () => void, reason: string) => {
      if (me) return fn();
      pending.current = fn;
      setAuth({ mode: "login", reason });
    },
    [me],
  );

  const openAuth = useCallback((mode: AuthMode) => {
    pending.current = null;
    setAuth({ mode, reason: "" });
  }, []);

  const openPost = useCallback(() => gate(() => setPostOpen(true), "Log in to post your projects."), [gate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      pending.current = null;
      setAuth(null);
      setPostOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ctx: AppCtx = useMemo(() => ({ user: me, gate, openAuth, openPost, toast }), [me, gate, openAuth, openPost, toast]);

  const finishAuth = (u: PublicUser) => {
    setMe(u);
    setAuth(null);
    const fn = pending.current;
    pending.current = null;
    router.refresh();
    fn?.();
  };

  const doLogout = async () => {
    await logout();
    setMe(null);
    router.push("/feed");
    toast("Logged out");
  };

  const goMine = () => gate(() => router.push("/me"), "Log in to see your projects.");

  return (
    <AppContext.Provider value={ctx}>
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-5">
            <Link href="/" aria-label="ShipOrSkip home" className="text-ink no-underline hover:no-underline">
              <Logo size="sm" className="sm:hidden" />
              <Logo tagline className="max-sm:hidden" />
            </Link>
            <Suspense>
              <TopNav goMine={goMine} />
            </Suspense>
            <div className="ml-auto flex items-center gap-3 text-[14px] sm:gap-4">
              {me ? (
                <>
                  <span className="hidden max-w-[140px] truncate text-muted-2 sm:inline">@{me.handle}</span>
                  <button onClick={doLogout} className="p-0 whitespace-nowrap text-primary hover:underline">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => openAuth("signup")} className="p-0 whitespace-nowrap text-primary hover:underline">
                    Create account
                  </button>
                  <button onClick={() => openAuth("login")} className="p-0 whitespace-nowrap text-primary hover:underline">
                    Log in
                  </button>
                </>
              )}
              <button onClick={openPost} className="btn btn-primary text-[14px]">
                + Post projects
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1120px] flex-1 items-start gap-8 px-4 pt-5 pb-14 sm:px-5">
          <aside className="sticky top-5 hidden w-[176px] shrink-0 flex-col gap-6 text-[14px] min-[860px]:flex">
            <Suspense>
              <SideNav goMine={goMine} />
            </Suspense>
            {topBuilders.length > 0 && (
              <div>
                <div className="mb-1.5 border-b border-divider pb-1 text-[13px] text-muted-3">Top builders</div>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {topBuilders.map((b) => (
                    <li key={b.id} className="flex items-center gap-2">
                      <Avatar handle={b.handle} url={b.avatarUrl} size={18} />
                      <Link href="/leaderboards">@{b.handle}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        <SiteFooter />

        <AnimatePresence>
        {postOpen && (
          <PostPanel
            key="post"
            githubMock={githubMock}
            onClose={() => setPostOpen(false)}
            onPosted={(id) => {
              setPostOpen(false);
              router.push(`/me?c=${id}`);
              toast("Posted. Share it to get votes.");
            }}
          />
        )}
        {auth && (
          <AuthModal
            key="auth"
            mode={auth.mode}
            reason={auth.reason}
            onMode={(mode) => setAuth({ ...auth, mode })}
            onClose={() => {
              pending.current = null;
              setAuth(null);
            }}
            onDone={finishAuth}
            onForgot={() => toast("Password reset isn't available yet. Use GitHub to log in.")}
          />
        )}
        {toastText && (
          <motion.div
            key={toastText}
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-40 w-max max-w-[calc(100%-32px)] -translate-x-1/2 border border-border border-l-4 border-l-primary bg-white px-4 py-2.5 text-[15px] text-ink shadow-[0_2px_8px_rgba(0,0,0,.15)]"
          >
            {toastText}
          </motion.div>
        )}
        </AnimatePresence>
        <Suspense>
          <UrlSignals onPost={openPost} onLogin={openAuth} toast={toast} />
        </Suspense>
      </div>
    </AppContext.Provider>
  );
}

function useActive() {
  const pathname = usePathname();
  const sort = useSearchParams().get("sort") || "hot";
  return (k: string) => {
    if (["hot", "new", "ending"].includes(k)) return (pathname === "/feed" || pathname.startsWith("/c/")) && sort === k;
    if (k === "feed") return pathname === "/feed" || pathname.startsWith("/c/");
    return pathname === "/" + k;
  };
}

function SideNav({ goMine }: { goMine: () => void }) {
  const active = useActive();
  const item = (on: boolean) => (on ? "font-bold text-ink hover:text-ink" : "");
  const head = "mb-1.5 border-b border-divider pb-1 text-[13px] text-muted-3";
  return (
    <nav className="flex flex-col gap-6">
      <div>
        <div className={head}>Main menu</div>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          <li><Link href="/">Main page</Link></li>
          <li><Link href="/feed" className={item(active("hot"))}>Hot campaigns</Link></li>
          <li><Link href="/feed?sort=new" className={item(active("new"))}>New campaigns</Link></li>
          <li><Link href="/feed?sort=ending" className={item(active("ending"))}>Ending soon</Link></li>
        </ul>
      </div>
      <div>
        <div className={head}>Community</div>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          <li><Link href="/leaderboards" className={item(active("leaderboards"))}>Leaderboards</Link></li>
          <li><button onClick={goMine} className={`p-0 text-left text-primary hover:underline ${item(active("me"))}`}>My projects</button></li>
          <li><Link href="/about" className={item(active("about"))}>About</Link></li>
          <li><Link href="/brand" className={item(active("brand"))}>Brand kit</Link></li>
        </ul>
      </div>
    </nav>
  );
}

function TopNav({ goMine }: { goMine: () => void }) {
  const active = useActive();
  // Encyclopedia-style tabs: the active one is black with a dark underline.
  const tab = (on: boolean) => `shrink-0 border-b-2 px-1 pb-1.5 text-[14px] ${on ? "border-ink text-ink hover:text-ink" : "border-transparent"}`;
  return (
    <nav className="no-scrollbar order-last -mx-4 flex w-[calc(100%+32px)] gap-4 overflow-x-auto border-t border-divider px-4 pt-2 whitespace-nowrap sm:-mx-5 sm:w-[calc(100%+40px)] sm:px-5 min-[860px]:hidden">
      <Link href="/feed" className={tab(active("feed"))}>Vote</Link>
      <Link href="/leaderboards" className={tab(active("leaderboards"))}>Leaderboards</Link>
      <button onClick={goMine} className={`text-primary ${tab(active("me"))}`}>My projects</button>
      <Link href="/about" className={tab(active("about"))}>About</Link>
    </nav>
  );
}

/** One-shot signals passed back via the URL after redirects (OAuth, Stripe). */
function UrlSignals({ onPost, onLogin, toast }: { onPost: () => void; onLogin: (m: AuthMode) => void; toast: (t: string) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const msgs: Record<string, string> = { boosted: "Boosted for 48 hours", "github=taken": "That GitHub account is linked to another user", "auth=failed": "GitHub login failed" };
    const keys = ["post", "login", "boosted", "github", "auth"];
    if (!keys.some((k) => params.has(k))) return;
    if (params.get("post") === "1") onPost();
    if (params.get("login") === "1") onLogin("login");
    if (params.get("boosted") === "1") toast(msgs.boosted);
    if (params.get("github") === "taken") toast(msgs["github=taken"]);
    if (params.get("auth") === "failed") toast(msgs["auth=failed"]);
    const next = new URLSearchParams(params);
    keys.forEach((k) => next.delete(k));
    router.replace(pathname + (next.size ? `?${next}` : ""), { scroll: false });
  }, [params, onPost, onLogin, toast, router, pathname]);
  return null;
}
