// Resolves the Postgres URL from the env var names common hosts use.
// Shared by the app (src/lib/db.ts) and the Vercel build (scripts/vercel-build.mjs).

const first = (names) => {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v) return { name: n, url: v };
  }
  return null;
};

/** Pooled/runtime URL: our own name first, then Neon, Supabase, Vercel Postgres. */
export const RUNTIME_VARS = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];
/** Direct URL for migrations (poolers break `prisma migrate`). */
export const DIRECT_VARS = ["DIRECT_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"];

/** PgBouncer in transaction mode needs Prisma's pgbouncer flag. */
function withPoolerFlag(url) {
  try {
    const u = new URL(url);
    const pooled = u.hostname.includes("-pooler") || u.port === "6543" || u.hostname.includes("pooler.supabase");
    if (pooled && !u.searchParams.has("pgbouncer")) u.searchParams.set("pgbouncer", "true");
    return u.toString();
  } catch {
    return url;
  }
}

/** @returns {{ name: string, url: string } | null} */
export function runtimeDbUrl() {
  const hit = first(RUNTIME_VARS);
  return hit && { ...hit, url: withPoolerFlag(hit.url) };
}

/** Migrations need a plain session connection: drop pooler-only flags. */
function withoutPoolerFlags(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete("pgbouncer");
    u.searchParams.delete("connection_limit");
    return u.toString();
  } catch {
    return url;
  }
}

/** @returns {{ name: string, url: string } | null} */
export function directDbUrl() {
  const hit = first(DIRECT_VARS) ?? first(RUNTIME_VARS);
  return hit && { ...hit, url: withoutPoolerFlags(hit.url) };
}
