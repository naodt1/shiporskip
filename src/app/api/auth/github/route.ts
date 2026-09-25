import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createSession, freeHandle } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { db } from "@/lib/db";
import { githubConfigured, mockMode } from "@/lib/github";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/feed");

/** Starts GitHub OAuth. `?next=/path` returns there afterwards. */
export async function GET(req: NextRequest) {
  const next = safeNext(req.nextUrl.searchParams.get("next"));

  if (!githubConfigured()) {
    if (!mockMode()) return NextResponse.json({ error: "GitHub login is not configured" }, { status: 503 });
    // Local dev without an OAuth app: sign in as a demo GitHub user.
    const handle = "you";
    const user =
      (await db.user.findUnique({ where: { handle } })) ??
      (await db.user.create({ data: { handle: await freeHandle(handle), githubLogin: handle } }));
    if (!user.githubLogin) await db.user.update({ where: { id: user.id }, data: { githubLogin: user.handle } });
    await createSession(user.id);
    return NextResponse.redirect(new URL(next, appUrl()));
  }

  const state = randomBytes(16).toString("hex");
  (await cookies()).set("gh_oauth", JSON.stringify({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
  url.searchParams.set("redirect_uri", `${appUrl()}/api/auth/github/callback`);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return NextResponse.redirect(url);
}
