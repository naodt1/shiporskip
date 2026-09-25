import "server-only";
import { ineligible } from "./config";

export type Repo = {
  fullName: string;
  name: string;
  desc: string;
  commits: number;
  pushedAt: string;
  released: boolean;
  reason: "" | "finished" | "just an idea";
};

type GhUser = { githubLogin: string | null; githubToken: string | null };

export const githubConfigured = () => !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

/** Without an OAuth app we serve fixed repos so the post flow works locally. */
export const mockMode = () => !githubConfigured() && process.env.NODE_ENV !== "production";

const DAY = 86_400_000;
const MOCK_REPOS: { name: string; desc: string; daysAgo: number; commits: number; released?: boolean }[] = [
  { name: "moodring", desc: "Slack status that follows your calendar", daysAgo: 2, commits: 86 },
  { name: "gitgrass", desc: "Weekly email of what you actually committed", daysAgo: 6, commits: 142 },
  { name: "tabnap", desc: "Browser extension that sleeps tabs you forgot", daysAgo: 19, commits: 45 },
  { name: "envy", desc: "Sync .env files across machines", daysAgo: 3, commits: 388, released: true },
  { name: "ai-recipe-idea", desc: "Idea: recipes from fridge photos", daysAgo: 60, commits: 2 },
  { name: "tinyforms", desc: "Forms that post straight to a Google Sheet", daysAgo: 52, commits: 73 },
];

function mockRepos(login: string): Repo[] {
  return MOCK_REPOS.map((r) => {
    const released = !!r.released;
    return {
      fullName: `${login}/${r.name}`,
      name: r.name,
      desc: r.desc,
      commits: r.commits,
      pushedAt: new Date(Date.now() - r.daysAgo * DAY).toISOString(),
      released,
      reason: ineligible({ commits: r.commits, released }),
    };
  });
}

async function gh(path: string, token: string) {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "shiporskip",
    },
    cache: "no-store",
  });
}

async function commitCount(fullName: string, token: string) {
  const res = await gh(`/repos/${fullName}/commits?per_page=1`, token);
  if (res.status === 409) return 0; // empty repo
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${fullName}`);
  const last = res.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/);
  if (last) return Number(last[1]);
  return ((await res.json()) as unknown[]).length;
}

async function hasRelease(fullName: string, token: string) {
  const res = await gh(`/repos/${fullName}/releases?per_page=1`, token);
  if (!res.ok) return false;
  return ((await res.json()) as unknown[]).length > 0;
}

type RawRepo = { full_name: string; name: string; description: string | null; pushed_at: string; fork: boolean; private: boolean; owner: { login: string } };

async function enrich(r: RawRepo, token: string): Promise<Repo> {
  const [commits, released] = await Promise.all([commitCount(r.full_name, token), hasRelease(r.full_name, token)]);
  return {
    fullName: r.full_name,
    name: r.name,
    desc: r.description || "",
    commits,
    pushedAt: r.pushed_at,
    released,
    reason: ineligible({ commits, released }),
  };
}

/** The user's public repos, most recently pushed first. */
export async function listRepos(user: GhUser): Promise<Repo[]> {
  if (!user.githubLogin) return [];
  if (mockMode() || !user.githubToken) return mockMode() ? mockRepos(user.githubLogin) : [];
  const res = await gh(`/user/repos?visibility=public&affiliation=owner&sort=pushed&per_page=20`, user.githubToken);
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const raw = ((await res.json()) as RawRepo[]).filter((r) => !r.fork && !r.private);
  return Promise.all(raw.map((r) => enrich(r, user.githubToken!)));
}

/** Fetches one repo fresh from GitHub; null if it isn't the user's public repo. */
export async function getRepo(user: GhUser, fullName: string): Promise<Repo | null> {
  if (!user.githubLogin) return null;
  if (mockMode()) return mockRepos(user.githubLogin).find((r) => r.fullName === fullName) ?? null;
  if (!user.githubToken) return null;
  const res = await gh(`/repos/${fullName}`, user.githubToken);
  if (!res.ok) return null;
  const r = (await res.json()) as RawRepo;
  if (r.private || r.owner.login.toLowerCase() !== user.githubLogin.toLowerCase()) return null;
  return enrich(r, user.githubToken);
}
