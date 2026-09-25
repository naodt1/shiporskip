/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { connectMockGithub, myRepos, publish } from "@/app/actions";
import { MAX_PROJECTS, MIN_PROJECTS } from "@/lib/config";
import { agoShort } from "@/lib/format";
import type { Repo } from "@/lib/github";
import { useApp } from "./AppContext";

type Extra = { preview?: string; imageUrl?: string; uploading?: boolean; offer?: string; code?: string };

export function PostPanel({ githubMock, onClose, onPosted }: { githubMock: boolean; onClose: () => void; onPosted: (id: string) => void }) {
  const { user, toast } = useApp();
  const connected = !!user?.github;
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [extras, setExtras] = useState<Record<string, Extra>>({});
  const [title, setTitle] = useState("");
  const [boost, setBoost] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!connected) return;
    let live = true;
    myRepos().then(
      (r) => live && setRepos(r),
      () => live && setLoadErr("Couldn't load your repos from GitHub. Try again."),
    );
    return () => {
      live = false;
    };
  }, [connected]);

  const connect = async () => {
    if (!githubMock) {
      // Full navigation: OAuth starts in a route handler.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/api/auth/github?next=${encodeURIComponent(window.location.pathname + "?post=1")}`;
      return;
    }
    const r = await connectMockGithub();
    toast(r.error || "GitHub connected");
  };

  const setExt = (k: string, p: Partial<Extra>) => setExtras((s) => ({ ...s, [k]: { ...s[k], ...p } }));

  const onImg = async (k: string, file: File | undefined) => {
    if (!file) return;
    setExt(k, { preview: URL.createObjectURL(file), uploading: true, imageUrl: undefined });
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      setExt(k, { preview: undefined, uploading: false });
      toast(data.error || "Upload failed");
      return;
    }
    setExt(k, { imageUrl: data.url, uploading: false });
  };

  const full = picked.length >= MAX_PROJECTS;
  const uploading = picked.some((k) => extras[k]?.uploading);
  const cant = picked.length < MIN_PROJECTS || busy || uploading;

  const submit = async () => {
    if (cant) return;
    setBusy(true);
    setError("");
    try {
      const r = await publish({
        title,
        boost,
        items: picked.map((k) => ({ repoFullName: k, imageUrl: extras[k]?.imageUrl, offer: extras[k]?.offer, promoCode: extras[k]?.code })),
      });
      if (!r.ok) return setError(r.error);
      if (r.checkoutUrl) window.location.href = r.checkoutUrl;
      else onPosted(r.id);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const byName = new Map((repos ?? []).map((r) => [r.fullName, r]));

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-30 bg-[rgba(26,26,26,.28)]" />
      <div role="dialog" aria-modal="true" aria-labelledby="post-heading" className="fixed top-0 right-0 bottom-0 z-31 w-[min(480px,100%)] overflow-auto overscroll-contain bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:p-6 shadow-[-12px_0_32px_rgba(0,0,0,.1)]">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1 text-[22px] leading-none text-muted-2 hover:text-ink">
          ×
        </button>
        <h1 id="post-heading" className="m-0 mb-1 text-xl font-bold">
          Post 2–5 projects
        </h1>
        <p className="m-0 mb-3.5 text-sm text-muted-2">From GitHub only. In progress: not finished, not just an idea.</p>

        {!connected && (
          <button onClick={connect} className="rounded-md bg-ink px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-ink-hover">
            Connect GitHub
          </button>
        )}

        {connected && (
          <>
            <div className="mb-2.5 font-semibold">Your repos</div>
            <div className="mb-4 rounded-[10px] border border-border bg-white">
              {!repos && !loadErr && <div className="px-3.5 py-3 text-sm text-muted-3">Loading repos…</div>}
              {loadErr && <div className="px-3.5 py-3 text-sm text-urgent">{loadErr}</div>}
              {repos?.length === 0 && <div className="px-3.5 py-3 text-sm text-muted-3">No public repos found.</div>}
              {repos?.map((r, i) => {
                const on = picked.includes(r.fullName);
                const disabled = !!r.reason || (!on && full);
                return (
                  <label
                    key={r.fullName}
                    style={{ opacity: r.reason ? 0.55 : 1 }}
                    className={`flex items-start gap-3 px-3.5 py-2 ${i ? "border-t border-divider" : ""} ${r.reason ? "cursor-not-allowed" : "cursor-pointer"} ${on ? "bg-green-tint-3" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={disabled}
                      onChange={() => setPicked((p) => (on ? p.filter((n) => n !== r.fullName) : [...p, r.fullName]))}
                      className="mt-1 h-4 w-4 accent-green"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold">{r.name}</span>
                      <span className="text-sm text-muted">{r.desc}</span>
                    </span>
                    <span className={`text-right font-mono text-xs whitespace-nowrap ${r.reason ? "text-urgent" : "text-muted-3"}`}>
                      {r.reason || `${r.commits} commits · ${agoShort(r.pushedAt)} ago`}
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}

        {picked.length > 0 && (
          <div className="mt-4.5">
            <div className="mb-2 font-semibold">
              Image &amp; offer <span className="text-sm font-normal text-muted-3">optional</span>
            </div>
            <div className="rounded-[10px] border border-border bg-white">
              {picked.map((k, i) => {
                const e = extras[k] ?? {};
                return (
                  <div key={k} className={`grid grid-cols-[56px_minmax(0,1fr)] items-start gap-3 px-3.5 py-2.5 ${i ? "border-t border-divider" : ""}`}>
                    <label className="grid h-14 w-14 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-dash bg-bg text-center text-[11px] leading-tight text-muted-3">
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(ev) => onImg(k, ev.target.files?.[0])} className="hidden" />
                      {e.preview ? <img src={e.preview} alt="" className={`h-14 w-14 object-cover ${e.uploading ? "opacity-50" : ""}`} /> : <span>+ image</span>}
                    </label>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="font-semibold">{byName.get(k)?.name ?? k}</span>
                      <div className="grid grid-cols-1 gap-1.5 min-[400px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                        <input
                          value={e.offer ?? ""}
                          onChange={(ev) => setExt(k, { offer: ev.target.value })}
                          placeholder="Offer, e.g. 30% off"
                          maxLength={60}
                          className="min-w-0 rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm"
                        />
                        <input
                          value={e.code ?? ""}
                          onChange={(ev) => setExt(k, { code: ev.target.value.toUpperCase() })}
                          placeholder="Promo code"
                          maxLength={32}
                          className="min-w-0 rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-sm uppercase placeholder:normal-case"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {connected && (
          <div className="mt-4 flex flex-col gap-2.5">
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Title (optional)" className="rounded-md border border-border bg-white px-3 py-2.5" />
            <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
              <input type="checkbox" checked={boost} onChange={() => setBoost(!boost)} className="mt-[3px] h-4 w-4 accent-green" />
              <span>
                Boost for $9 <span className="text-muted-3">· pinned 48h</span>
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={submit}
                disabled={cant}
                style={{ opacity: picked.length < MIN_PROJECTS ? 0.4 : 1 }}
                className="rounded-md bg-green px-4.5 py-2.5 text-[15px] font-semibold text-white hover:bg-green-hover"
              >
                {busy ? "Posting…" : `Post${boost ? " · $9" : ""}`}
              </button>
              <span className="text-sm text-muted-2">
                {picked.length}/{MAX_PROJECTS}
              </span>
            </div>
            {error && <p className="m-0 text-sm text-urgent">{error}</p>}
          </div>
        )}
      </div>
    </>
  );
}
