# ShipOrSkip

Indie hackers post 2–5 unfinished GitHub side projects; other builders vote on the one to finish.
Built from `../design_handoff_shiporskip`.

**Stack:** Next.js 16 (App Router, server actions) · Tailwind v4 · Prisma 6 + Postgres · cookie sessions + bcrypt · GitHub OAuth · Stripe Checkout.

## Run locally

```bash
npm install
cp .env.example .env
npm run db:dev      # local Postgres via `prisma dev` (no Docker); URL already in .env.example
npm run db:migrate  # apply prisma/migrations
npm run db:seed     # design's placeholder data
npm run dev
```

`db:dev` prints the connection string; if the port differs, update `DATABASE_URL`. The local server takes one connection at a time, hence `pgbouncer=true&connection_limit=1` in the URL.

Demo login: `you@example.com` / `password123` (every seeded named user, e.g. `mara@example.com`, uses the same password).

With the `.env` keys left empty, everything works locally:

| Missing key | Dev fallback |
| --- | --- |
| `GITHUB_CLIENT_ID/SECRET` | "Continue with GitHub" signs in as `@you`; "Connect GitHub" lists the mock repos from the design |
| `STRIPE_SECRET_KEY` | Boosts apply instantly, no payment |
| `BLOB_READ_WRITE_TOKEN` | Images are written to `public/uploads` (dev only — not served by `next start`) |

In production (`NODE_ENV=production`) the GitHub mock is disabled, and uploads require Blob.

## Production setup

1. **Database:** in Vercel → Storage → Create Database → Neon (Postgres), connected to this project for all environments. It sets the connection env vars; don't also add an empty `DATABASE_URL` by hand.
   - The app accepts `DATABASE_URL`, `POSTGRES_PRISMA_URL` or `POSTGRES_URL` (see `src/lib/db-url.mjs`); pooled hosts get `pgbouncer=true` automatically.
   - Vercel runs `scripts/vercel-build.mjs`: `prisma generate` → `prisma migrate deploy` over the direct URL (`DIRECT_URL`, `DATABASE_URL_UNPOOLED` or `POSTGRES_URL_NON_POOLING`) → `next build`. With no database configured it skips migrations with a warning instead of failing.
   - Schema changes: edit `schema.prisma`, run `npx prisma migrate dev --name <change>` locally, commit the migration.
2. **GitHub OAuth app:** callback `$APP_URL/api/auth/github/callback`. Scopes requested: `read:user user:email public_repo`.
3. **Stripe:** set `STRIPE_SECRET_KEY`, add a webhook to `$APP_URL/api/stripe/webhook` for `checkout.session.completed`, set `STRIPE_WEBHOOK_SECRET`.
4. **Images:** set `BLOB_READ_WRITE_TOKEN` (Vercel Blob).
5. Set `APP_URL` to the public origin.

## Where things live

- `src/lib/config.ts` — rules: `MIN_COMMITS`, `ineligible()`, campaign length, boost price/duration.
- `src/lib/queries.ts` — all reads. Promo codes are stripped here for anyone who hasn't voted (and isn't the owner).
- `src/app/actions.ts` — all writes (auth, vote, reason, publish, boost, commit, mark shipped). Eligibility is re-checked against GitHub on publish.
- `src/app/api/*` — GitHub OAuth, Stripe webhook, image upload.
- `src/components/AppShell.tsx` — header, sidebar, auth modal/post panel, toast, login gating (`gate()` runs the attempted action after login).

## Not built yet

- Password reset email ("Forgot?" currently says it's unavailable).
- Notifying voters when a committed project ships.
- The prototype's ad rails (`showAds`, off in the design).
