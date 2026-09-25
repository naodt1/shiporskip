"use server";

import { refresh } from "next/cache";
import { checkPassword, createSession, destroySession, getUser, hashPassword, publicUser, type PublicUser } from "@/lib/auth";
import { CAMPAIGN_DAYS, EMAIL_RE, HANDLE_RE, MAX_PROJECTS, MIN_PASSWORD, MIN_PROJECTS } from "@/lib/config";
import { db } from "@/lib/db";
import { getRepo, listRepos, mockMode, type Repo } from "@/lib/github";
import { applyBoost, boostCheckoutUrl, stripeEnabled } from "@/lib/stripe";
import { isOurImageUrl } from "@/lib/upload";

type Field = "handle" | "email" | "pw";
export type AuthResult = { ok: true; user: PublicUser } | { ok: false; field: Field; error: string };

/** Returned instead of thrown: production builds strip thrown messages. */
export type ActionResult = { error?: string };

class Fail extends Error {}

async function requireUser() {
  const u = await getUser();
  if (!u) throw new Fail("Log in first");
  return u;
}

async function attempt(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    return {};
  } catch (e) {
    if (e instanceof Fail) return { error: e.message };
    throw e;
  }
}

// ---- Auth ----

export async function signup(input: { handle: string; email: string; pw: string }): Promise<AuthResult> {
  const handle = input.handle.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  if (!HANDLE_RE.test(handle)) return { ok: false, field: "handle", error: "Use 2+ letters, numbers, _ . or -" };
  if (!EMAIL_RE.test(email)) return { ok: false, field: "email", error: "Enter a valid email" };
  if (input.pw.length < MIN_PASSWORD) return { ok: false, field: "pw", error: "At least 8 characters" };
  if (await db.user.findUnique({ where: { handle } })) return { ok: false, field: "handle", error: "That username is taken" };
  if (await db.user.findUnique({ where: { email } })) return { ok: false, field: "email", error: "An account with this email exists" };
  const user = await db.user.create({ data: { handle, email, passwordHash: await hashPassword(input.pw) } });
  await createSession(user.id);
  return { ok: true, user: publicUser(user)! };
}

export async function login(input: { email: string; pw: string }): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, field: "email", error: "Enter a valid email" };
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await checkPassword(input.pw, user.passwordHash)))
    return { ok: false, field: "pw", error: "Wrong email or password" };
  await createSession(user.id);
  return { ok: true, user: publicUser(user)! };
}

export async function logout() {
  await destroySession();
  refresh();
}

// ---- Voting ----

export async function vote(campaignId: string, projectId: string) {
  return attempt(async () => {
    const u = await requireUser();
    const c = await db.campaign.findUnique({ where: { id: campaignId }, include: { projects: { select: { id: true } } } });
    if (!c) throw new Fail("Campaign not found");
    if (c.userId === u.id) throw new Fail("You can't vote on your own campaign");
    if (c.status !== "open" || c.closesAt <= new Date()) throw new Fail("Voting has closed");
    if (!c.projects.some((p) => p.id === projectId)) throw new Fail("Unknown project");
    await db.vote.upsert({
      where: { userId_campaignId: { userId: u.id, campaignId } },
      create: { userId: u.id, campaignId, projectId },
      update: { projectId },
    });
    refresh();
  });
}

export async function sendReason(campaignId: string, text: string) {
  return attempt(async () => {
    const u = await requireUser();
    const reason = text.trim().slice(0, 280);
    if (!reason) return;
    const v = await db.vote.findUnique({ where: { userId_campaignId: { userId: u.id, campaignId } } });
    if (!v) throw new Fail("Vote first");
    await db.vote.update({ where: { userId_campaignId: { userId: u.id, campaignId } }, data: { reason } });
    refresh();
  });
}

// ---- Posting ----

export async function connectMockGithub() {
  return attempt(async () => {
    if (!mockMode()) throw new Fail("GitHub OAuth is configured; use /api/auth/github");
    const u = await requireUser();
    await db.user.update({ where: { id: u.id }, data: { githubLogin: u.handle } });
    refresh();
  });
}

export async function myRepos(): Promise<Repo[]> {
  const u = await requireUser();
  return listRepos(u);
}

export type PublishItem = { repoFullName: string; imageUrl?: string; offer?: string; promoCode?: string };
export type PublishResult = { ok: true; id: string; checkoutUrl?: string } | { ok: false; error: string };

export async function publish(input: { title: string; boost: boolean; items: PublishItem[] }): Promise<PublishResult> {
  const u = await getUser();
  if (!u) return { ok: false, error: "Log in first" };
  if (!u.githubLogin) return { ok: false, error: "Connect GitHub first" };
  const names = [...new Set(input.items.map((i) => i.repoFullName))];
  if (names.length !== input.items.length) return { ok: false, error: "Duplicate repo" };
  if (names.length < MIN_PROJECTS || names.length > MAX_PROJECTS) return { ok: false, error: `Pick ${MIN_PROJECTS}–${MAX_PROJECTS} repos` };

  // Re-check eligibility against GitHub now, not what the client saw.
  const repos = await Promise.all(names.map((n) => getRepo(u, n)));
  for (let i = 0; i < repos.length; i++) {
    const r = repos[i];
    if (!r) return { ok: false, error: `${names[i]} isn't one of your public repos` };
    if (r.reason) return { ok: false, error: `${r.name} is ${r.reason}` };
  }

  const clean = (s: string | undefined, max: number) => (s ?? "").trim().slice(0, max) || null;
  const c = await db.campaign.create({
    data: {
      userId: u.id,
      title: clean(input.title, 120),
      closesAt: new Date(Date.now() + CAMPAIGN_DAYS * 86_400_000),
      projects: {
        create: input.items.map((it, i) => {
          const r = repos[i]!;
          return {
            position: i,
            repoFullName: r.fullName,
            name: r.name,
            oneliner: r.desc || "No description yet",
            commits: r.commits,
            lastPushAt: new Date(r.pushedAt),
            imageUrl: it.imageUrl && isOurImageUrl(it.imageUrl) ? it.imageUrl : null,
            offer: clean(it.offer, 60),
            promoCode: clean(it.promoCode, 32)?.toUpperCase() ?? null,
          };
        }),
      },
    },
  });

  if (input.boost) {
    if (stripeEnabled()) return { ok: true, id: c.id, checkoutUrl: await boostCheckoutUrl(c.id, u.id) };
    await applyBoost(c.id);
  }
  refresh();
  return { ok: true, id: c.id };
}

// ---- Owner actions ----

async function ownCampaign(id: string) {
  const u = await requireUser();
  const c = await db.campaign.findUnique({ where: { id }, include: { commitment: true } });
  if (!c || c.userId !== u.id) throw new Fail("Not your campaign");
  return { u, c };
}

export async function boost(campaignId: string): Promise<ActionResult & { checkoutUrl?: string }> {
  let checkoutUrl: string | undefined;
  const r = await attempt(async () => {
    const { u, c } = await ownCampaign(campaignId);
    if (c.status !== "open" || c.closesAt <= new Date()) throw new Fail("Campaign is closed");
    if (stripeEnabled()) {
      checkoutUrl = await boostCheckoutUrl(c.id, u.id);
      return;
    }
    await applyBoost(c.id);
    refresh();
  });
  return { ...r, checkoutUrl };
}

export async function commit(campaignId: string, projectId: string) {
  return attempt(async () => {
    const { c } = await ownCampaign(campaignId);
    if (c.commitment) return;
    if (!(await db.project.findFirst({ where: { id: projectId, campaignId } }))) throw new Fail("Unknown project");
    await db.commitment.create({ data: { campaignId, projectId } });
    refresh();
  });
}

export async function markShipped(campaignId: string) {
  return attempt(async () => {
    const { c } = await ownCampaign(campaignId);
    if (!c.commitment || c.shippedProjectId) return;
    await db.campaign.update({
      where: { id: campaignId },
      data: { shippedProjectId: c.commitment.projectId, shippedAt: new Date(), status: "closed" },
    });
    refresh();
  });
}
