// Applies prisma/migrations using the direct (unpooled) database URL.
// Used by `npm run db:migrate` and the Vercel build.
import { execSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { directDbUrl } from "../src/lib/db-url.mjs";

export function loadLocalEnv() {
  // Vercel has no .env file; variables already set always win.
  try {
    process.loadEnvFile(".env");
  } catch {}
}

const bin = path.join(process.cwd(), "node_modules", ".bin");
export const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, ...env } });

/** @returns {boolean} whether migrations ran */
export function migrate() {
  const direct = directDbUrl();
  if (!direct) return false;
  const schema = new URL(direct.url).searchParams.get("schema");
  console.log(`▲ Running migrations using ${direct.name} (schema "${schema}")`);
  run("prisma migrate deploy", { DATABASE_URL: direct.url });
  return true;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  loadLocalEnv();
  if (!migrate()) {
    console.error("No database URL found. Set DATABASE_URL in .env (see .env.example).");
    process.exit(1);
  }
}
