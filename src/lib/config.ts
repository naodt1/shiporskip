// Product rules. Thresholds are adjustable.
export const MIN_COMMITS = 10;
export const MIN_PROJECTS = 2;
export const MAX_PROJECTS = 5;
export const CAMPAIGN_DAYS = 3;
export const BOOST_HOURS = 48;
export const BOOST_PRICE_CENTS = 900;

export type RepoFacts = { commits: number; released: boolean };

/** Returns the reason a repo can't be posted, or "" if it's eligible. */
export function ineligible(r: RepoFacts): "" | "finished" | "just an idea" {
  if (r.released) return "finished";
  if (r.commits < MIN_COMMITS) return "just an idea";
  return "";
}

export const HANDLE_RE = /^[a-z0-9_.-]{2,}$/i;
export const EMAIL_RE = /^\S+@\S+\.\S+$/;
export const MIN_PASSWORD = 8;

export const appUrl = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
export const shareUrl = (id: string) => `${appUrl()}/c/${id}`;
