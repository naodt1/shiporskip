"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { login, signup, type AuthResult } from "@/app/actions";
import type { PublicUser } from "@/lib/auth";
import type { AuthMode } from "./AppContext";
import { GitHubMark } from "./icons";

type Field = "handle" | "email" | "pw";

const inputCls = (bad: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] outline-none focus:border-green focus:shadow-[0_0_0_3px_var(--color-green-tint-2)] ${bad ? "border-urgent" : "border-outline"}`;

export function AuthModal({
  mode,
  reason,
  onMode,
  onClose,
  onDone,
  onForgot,
}: {
  mode: AuthMode;
  reason: string;
  onMode: (m: AuthMode) => void;
  onClose: () => void;
  onDone: (u: PublicUser) => void;
  onForgot: () => void;
}) {
  const pathname = usePathname();
  const [f, setF] = useState({ handle: "", email: "", pw: "" });
  const [err, setErr] = useState<{ field: Field; error: string } | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const signupMode = mode === "signup";

  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF({ ...f, [k]: e.target.value });
    if (err?.field === k) setErr(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mirror the server checks for instant feedback.
    if (signupMode && !/^[a-z0-9_.-]{2,}$/i.test(f.handle.trim())) return setErr({ field: "handle", error: "Use 2+ letters, numbers, _ . or -" });
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setErr({ field: "email", error: "Enter a valid email" });
    if (f.pw.length < 8) return setErr({ field: "pw", error: signupMode ? "At least 8 characters" : "Wrong email or password" });
    setBusy(true);
    let r: AuthResult;
    try {
      r = signupMode ? await signup(f) : await login(f);
    } finally {
      setBusy(false);
    }
    if (!r.ok) return setErr({ field: r.field, error: r.error });
    onDone(r.user);
  };

  const switchMode = () => {
    onMode(signupMode ? "login" : "signup");
    setErr(null);
  };

  const errFor = (k: Field) => err?.field === k && <span className="text-[13px] text-urgent">{err.error}</span>;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-30 bg-[rgba(26,26,26,.4)]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-heading"
        className="fixed top-1/2 left-1/2 z-31 max-h-[calc(100vh-32px)] w-[min(400px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[14px] bg-white p-7 shadow-[0_24px_64px_rgba(0,0,0,.18)]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full text-xl leading-none text-muted-3 hover:bg-fill hover:text-ink"
        >
          ×
        </button>
        <div className="mb-3.5 font-mono text-sm font-bold text-green">shiporskip</div>
        <h2 id="auth-heading" className="m-0 mb-1 text-[22px] leading-tight font-bold">
          {signupMode ? "Create your account" : "Welcome back"}
        </h2>
        <p className="m-0 mb-5.5 text-sm text-muted-2">
          {reason || (signupMode ? "Post projects and vote on what others should finish." : "Log in to vote and post.")}
        </p>
        <a
          href={`/api/auth/github?next=${encodeURIComponent(pathname || "/feed")}`}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-ink p-3 text-[15px] font-semibold text-white no-underline hover:bg-ink-hover hover:text-white"
        >
          <GitHubMark />
          Continue with GitHub
        </a>
        <div className="my-4.5 flex items-center gap-3 text-[13px] text-muted-3">
          <span className="h-px flex-1 bg-border" />
          or with email
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
          {signupMode && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Username</span>
              <input value={f.handle} onChange={set("handle")} autoComplete="username" placeholder="e.g. mara" className={inputCls(err?.field === "handle")} />
              {errFor("handle")}
            </label>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Email</span>
            <input type="email" value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" className={inputCls(err?.field === "email")} />
            {errFor("email")}
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between">
              <label htmlFor="auth-pw" className="text-sm font-semibold">Password</label>
              {!signupMode && (
                <button type="button" onClick={onForgot} className="p-0 text-[13px] text-green">
                  Forgot?
                </button>
              )}
            </span>
            <span className="relative block">
              <input
                id="auth-pw"
                type={showPw ? "text" : "password"}
                value={f.pw}
                onChange={set("pw")}
                autoComplete={signupMode ? "new-password" : "current-password"}
                placeholder={signupMode ? "8+ characters" : ""}
                className={`${inputCls(err?.field === "pw")} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md px-2 py-1 text-[13px] text-muted-2 hover:bg-fill"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </span>
            {errFor("pw")}
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-1 w-full rounded-lg bg-green p-3 text-[15px] font-semibold text-white hover:bg-green-hover disabled:opacity-60"
          >
            {signupMode ? "Create account" : "Log in"}
          </button>
        </form>
        <p className="m-0 mt-4.5 text-center text-sm text-muted-2">
          {signupMode ? "Already have an account?" : "New to ShipOrSkip?"}{" "}
          <button onClick={switchMode} className="p-0 text-sm font-semibold text-green">
            {signupMode ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </>
  );
}
