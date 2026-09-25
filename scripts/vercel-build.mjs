// Vercel build: generate the client, migrate if a database is configured, build.
import { runtimeDbUrl } from "../src/lib/db-url.mjs";
import { loadLocalEnv, migrate, run } from "./migrate.mjs";

loadLocalEnv();

const runtime = runtimeDbUrl();
// Prisma validates env("DATABASE_URL") even for `generate`; give it something non-empty.
const placeholder = "postgresql://build:build@localhost:5432/build";

run("prisma generate", { DATABASE_URL: runtime?.url ?? placeholder });

if (!migrate()) {
  console.warn(
    "\n⚠ No database URL found (checked DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL, DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING).\n" +
      "  Skipping migrations. The site will deploy but can't load data until you add a Postgres database\n" +
      "  (Vercel → Storage → Create Database → Neon) and redeploy.\n",
  );
}

run("next build", { DATABASE_URL: runtime?.url ?? placeholder });
