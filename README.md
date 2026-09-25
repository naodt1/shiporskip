# ShipOrSkip

Indie hackers post 2–5 unfinished GitHub side projects; other builders vote on the one to finish.
Built from `../design_handoff_shiporskip`.

**Stack:** Next.js 16 (App Router, server actions) · Tailwind v4 · Prisma 6 · cookie sessions + bcrypt · GitHub OAuth · Stripe Checkout.

## Run locally

```bash
npm install
npm run db:push     # create prisma/dev.db (SQLite)
npm run db:seed     # design's placeholder data
npm run dev
```

Demo login: `you@example.com` / `password123` (every seeded named user, e.g. `mara@example.com`, uses the same password).

With the `.env` keys left empty, everything works locally:

| Missing key | Dev fallback |
| --- | --- |
| `GITHUB_CLIENT_ID/SECRET` | "Continue with GitHub" signs in as `@you`; "Connect GitHub" lists the mock repos from the design |
| `STRIPE_SECRET_KEY` | Boosts apply instantly, no payment |
| `BLOB_READ_WRITE_TOKEN` | Images are written to `public/uploads` (dev only — not served by `next start`) |

In production (`NODE_ENV=production`) the GitHub mock is disabled.

## Production setup

1. **Database:** set `provider = "postgresql"` in `prisma/schema.prisma` and point `DATABASE_URL` at Postgres.
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
