"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { logout } from "@/app/actions";
import type { PublicUser } from "@/lib/auth";
import { AppContext, type AppCtx, type AuthMode } from "./AppContext";
import { AuthModal } from "./AuthModal";
import { Avatar } from "./Avatar";
import { Flame, Grid, Info, Plus, Clock, Trophy } from "./icons";
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
      <div className="min-h-screen">
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-5">
            <Link href="/feed" className="font-mono text-base font-bold no-underline hover:text-ink">
              shiporskip
            </Link>
            <Suspense>
              <TopNav goMine={goMine} />
            </Suspense>
            <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
              <button onClick={openPost} className="rounded-md bg-ink px-3 py-2 text-[15px] font-semibold whitespace-nowrap text-white hover:bg-ink-hover sm:px-3.5">
                + Post
              </button>
              {me ? (
                <>
                  <span className="hidden max-w-[120px] truncate text-sm text-muted sm:inline">@{me.handle}</span>
                  <button onClick={doLogout} className="p-0 text-sm whitespace-nowrap text-muted-2 underline">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => openAuth("login")} className="rounded-md px-2 py-[7px] text-[15px] whitespace-nowrap hover:bg-fill sm:px-2.5">
                    Log in
                  </button>
                  <button onClick={() => openAuth("signup")} className="rounded-md border border-outline bg-white px-3 py-[7px] text-[15px] font-semibold whitespace-nowrap hover:border-ink">
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1120px] items-start gap-7 px-4 pt-4 pb-12 sm:px-5 sm:pt-5">
          <aside className="sticky top-5 hidden w-[180px] shrink-0 flex-col gap-7 min-[860px]:flex">
            <Suspense>
              <SideNav goMine={goMine} />
            </Suspense>
            <div className="px-2.5">
              <div className="mb-2.5 text-[11px] tracking-[.06em] text-muted-3 uppercase">Top builders</div>
              <Link href="/leaderboards" className="flex" aria-label="Leaderboards">
                {topBuilders.map((b, k) => (
                  <Avatar key={b.id} handle={b.handle} url={b.avatarUrl} size={30} ring="#fafaf8" className={k ? "-ml-2" : ""} />
                ))}
              </Link>
            </div>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>

        {postOpen && (
          <PostPanel
            githubMock={githubMock}
            onClose={() => setPostOpen(false)}
            onPosted={(id) => {
              setPostOpen(false);
              router.push(`/me?c=${id}`);
              toast("Posted");
            }}
          />
        )}
        {auth && (
          <AuthModal
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
          <div role="status" className="fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-40 w-max max-w-[calc(100%-32px)] -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-center text-[15px] text-white">
            {toastText}
          </div>
        )}
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
  const item = (on: boolean) =>
    `flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[15px] no-underline hover:bg-fill ${on ? "bg-green-tint-2 font-semibold text-green-text hover:text-green-text" : "text-ink hover:text-ink"}`;
  return (
    <nav className="flex flex-col gap-0.5">
      <Link href="/feed" className={item(active("hot"))}><Flame />Hot</Link>
      <Link href="/feed?sort=new" className={item(active("new"))}><Plus />New</Link>
      <Link href="/feed?sort=ending" className={item(active("ending"))}><Clock />Ending soon</Link>
      <span className="mx-2.5 my-2 h-px bg-border" />
      <Link href="/leaderboards" className={item(active("leaderboards"))}><Trophy />Leaderboards</Link>
      <button onClick={goMine} className={item(active("me"))}><Grid />My projects</button>
      <Link href="/about" className={item(active("about"))}><Info />About</Link>
    </nav>
  );
}

function TopNav({ goMine }: { goMine: () => void }) {
  const active = useActive();
  const pill = (on: boolean) => `shrink-0 rounded-md px-3 py-1.5 text-[15px] no-underline hover:bg-fill hover:text-ink ${on ? "bg-fill font-semibold" : ""}`;
  return (
    <nav className="no-scrollbar order-last -mx-4 flex w-[calc(100%+32px)] gap-1 overflow-x-auto px-4 whitespace-nowrap sm:-mx-5 sm:w-[calc(100%+40px)] sm:px-5 min-[860px]:hidden">
      <Link href="/feed" className={pill(active("feed"))}>Vote</Link>
      <Link href="/leaderboards" className={pill(active("leaderboards"))}>Leaderboards</Link>
      <button onClick={goMine} className={pill(active("me"))}>My projects</button>
      <Link href="/about" className={pill(active("about"))}>About</Link>
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
