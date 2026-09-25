// Vercel build: generate the client, migrate if a database is configured, build.
import { execSync } from "node:child_process";
import path from "node:path";
import { directDbUrl, runtimeDbUrl } from "../src/lib/db-url.mjs";

// Local runs: pick up .env (Vercel has no .env file; existing vars win).
try {
  process.loadEnvFile(".env");
} catch {}

const bin = path.join(process.cwd(), "node_modules", ".bin");
const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, ...env } });

const runtime = runtimeDbUrl();
const direct = directDbUrl();
// Prisma validates env("DATABASE_URL") even for `generate`; give it something non-empty.
const placeholder = "postgresql://build:build@localhost:5432/build";

run("prisma generate", { DATABASE_URL: runtime?.url ?? placeholder });

if (direct) {
  console.log(`▲ Running migrations using ${direct.name}`);
  run("prisma migrate deploy", { DATABASE_URL: direct.url });
} else {
  console.warn(
    "\n⚠ No database URL found (checked DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL, DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING).\n" +
      "  Skipping migrations. The site will deploy but can't load data until you add a Postgres database\n" +
      "  (Vercel → Storage → Create Database → Neon) and redeploy.\n",
  );
}

run("next build", { DATABASE_URL: runtime?.url ?? placeholder });
