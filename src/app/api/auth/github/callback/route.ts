import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createSession, freeHandle, getUser } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { db } from "@/lib/db";

type GhProfile = { id: number; login: string; avatar_url: string; email: string | null };

export async function GET(req: NextRequest) {
  const jar = await cookies();
  const saved = jar.get("gh_oauth")?.value;
  jar.delete("gh_oauth");
  const { state, next } = saved ? (JSON.parse(saved) as { state: string; next: string }) : { state: "", next: "/feed" };
  const code = req.nextUrl.searchParams.get("code");
  if (!code || !state || req.nextUrl.searchParams.get("state") !== state)
    return NextResponse.redirect(new URL("/feed?auth=failed", appUrl()));

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${appUrl()}/api/auth/github/callback`,
    }),
  });
  const { access_token: token } = (await tokenRes.json()) as { access_token?: string };
  if (!token) return NextResponse.redirect(new URL("/feed?auth=failed", appUrl()));

  const profile = (await (
    await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token}`, "User-Agent": "shiporskip" } })
  ).json()) as GhProfile;
  const githubId = String(profile.id);
  const gh = { githubId, githubLogin: profile.login, githubToken: token, avatarUrl: profile.avatar_url };

  const current = await getUser();
  const linked = await db.user.findUnique({ where: { githubId } });
  let userId: string;

  if (current) {
    // "Connect GitHub" while logged in with email.
    if (linked && linked.id !== current.id) {
      const back = new URL(next, appUrl());
      back.searchParams.set("github", "taken");
      return NextResponse.redirect(back);
    }
    await db.user.update({ where: { id: current.id }, data: gh });
    userId = current.id;
  } else if (linked) {
    await db.user.update({ where: { id: linked.id }, data: gh });
    userId = linked.id;
  } else {
    const email = profile.email?.toLowerCase();
    const emailFree = email && !(await db.user.findUnique({ where: { email } }));
    const u = await db.user.create({ data: { ...gh, handle: await freeHandle(profile.login), email: emailFree ? email : null } });
    userId = u.id;
  }

  if (!current) await createSession(userId);
  return NextResponse.redirect(new URL(next, appUrl()));
}
