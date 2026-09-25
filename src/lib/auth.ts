import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { db } from "./db";

const COOKIE = "sos_session";
const TTL_MS = 30 * 86_400_000;

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export const hashPassword = (pw: string) => bcrypt.hash(pw, 11);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  jar.delete(COOKIE);
}

/** The logged-in user for this request, or null. */
export const getUser = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const s = await db.session.findUnique({ where: { id: hashToken(token) }, include: { user: true } });
  if (!s || s.expiresAt < new Date()) return null;
  return s.user;
});

export type PublicUser = { id: string; handle: string; avatarUrl: string | null; github: boolean };

export function publicUser(u: Awaited<ReturnType<typeof getUser>>): PublicUser | null {
  return u ? { id: u.id, handle: u.handle, avatarUrl: u.avatarUrl, github: !!u.githubLogin } : null;
}

/** Picks a free handle based on `base` (used for GitHub sign-ups). */
export async function freeHandle(base: string) {
  const clean = base.toLowerCase().replace(/[^a-z0-9_.-]/g, "") || "builder";
  for (let i = 0; i < 50; i++) {
    const h = i ? `${clean}${i + 1}` : clean;
    if (!(await db.user.findUnique({ where: { handle: h } }))) return h;
  }
  return `${clean}-${randomBytes(3).toString("hex")}`;
}
