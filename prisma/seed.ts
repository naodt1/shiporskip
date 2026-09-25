// Seeds the design's placeholder data. Run: npm run db:seed
// Demo login: you@example.com / password123
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runtimeDbUrl } from "../src/lib/db-url.mjs";

try {
  process.loadEnvFile(".env");
} catch {}
const db = new PrismaClient({ datasourceUrl: runtimeDbUrl()?.url });
const DAY = 86_400_000;
const now = Date.now();
const ago = (d: number) => new Date(now - d * DAY);
const ahead = (d: number) => new Date(now + d * DAY);

type P = { name: string; oneliner: string; commits: number; votes: number; offer?: string; code?: string };

async function main() {
  await db.$transaction([db.vote.deleteMany(), db.commitment.deleteMany(), db.project.deleteMany(), db.campaign.deleteMany(), db.session.deleteMany(), db.user.deleteMany()]);

  const pw = await bcrypt.hash("password123", 11);
  const named = ["mara", "devonk", "yuki", "nadia", "oskar", "priya", "lenhart", "r0b", "sam"];
  const users: Record<string, string> = {};
  for (const h of named) users[h] = (await db.user.create({ data: { handle: h, githubLogin: h, email: `${h}@example.com`, passwordHash: pw } })).id;
  users.you = (await db.user.create({ data: { handle: "you", githubLogin: "you", email: "you@example.com", passwordHash: pw } })).id;
  const voters: string[] = [];
  for (let i = 0; i < 250; i++) voters.push((await db.user.create({ data: { handle: `voter${i}` } })).id);

  async function campaign(owner: string, title: string, opts: { created: Date; closes: Date; boosted?: boolean }, projects: P[], reasons: [string, string, string][] = []) {
    const c = await db.campaign.create({
      data: {
        userId: users[owner],
        title,
        createdAt: opts.created,
        closesAt: opts.closes,
        status: opts.closes.getTime() > now ? "open" : "closed",
        boostedUntil: opts.boosted ? ahead(1.5) : null,
        projects: {
          create: projects.map((p, i) => ({
            position: i,
            repoFullName: `${owner}/${p.name}`,
            name: p.name,
            oneliner: p.oneliner,
            commits: p.commits,
            lastPushAt: ago(3 + i * 5),
            offer: p.offer,
            promoCode: p.code,
          })),
        },
      },
      include: { projects: true },
    });
    // Named reason-givers vote first, then anonymous voters fill the counts.
    const byName = new Map(c.projects.map((p) => [p.name, p.id]));
    for (const [h, proj, text] of reasons) {
      const uid = users[h];
      await db.vote.create({ data: { userId: uid, campaignId: c.id, projectId: byName.get(proj)!, reason: text } });
    }
    let k = 0;
    for (const p of c.projects) {
      const already = reasons.filter((r) => r[1] === p.name).length;
      const want = projects.find((x) => x.name === p.name)!.votes - already;
      await db.vote.createMany({ data: voters.slice(k, k + want).map((uid) => ({ userId: uid, campaignId: c.id, projectId: p.id })) });
      k += want;
    }
    return c;
  }

  await campaign("mara", "Three half-built things, one free weekend", { created: ago(1), closes: ahead(2.4), boosted: true }, [
    { name: "tallyho", commits: 212, oneliner: "Invoices that send themselves when a Stripe payment lands", votes: 96, offer: "30% off for voters", code: "VOTER30" },
    { name: "plotline", commits: 64, oneliner: "Markdown list in, project timeline image out", votes: 41 },
    { name: "quietcal", commits: 140, oneliner: "Auto-blocks focus time around your meetings", votes: 77 },
  ]);
  await campaign("devonk", "Two dev tools. Pick my poison.", { created: ago(0.5), closes: ahead(5.2) }, [
    { name: "stackdiff", commits: 301, oneliner: "Paste two package.json files, see what changed", votes: 52, offer: "Free Pro for a year", code: "SHIPIT" },
    { name: "lintlore", commits: 38, oneliner: "Every ESLint rule explained with an example", votes: 36 },
  ]);
  await campaign("yuki", "Four ideas, zero finished", { created: ago(2), closes: ahead(0.6) }, [
    { name: "halfbatch", commits: 57, oneliner: "Scale a recipe and convert units in one paste", votes: 22 },
    { name: "pairtimer", commits: 119, oneliner: "Shared pomodoro timer for remote pairing", votes: 51 },
    { name: "castfeed", commits: 176, oneliner: "Turn a newsletter into a private podcast feed", votes: 43, offer: "50% off at launch" },
    { name: "tinyrolo", commits: 22, oneliner: "A CRM that lives in one spreadsheet tab", votes: 15 },
  ]);
  await campaign("you", "Which one do I finish before December?", { created: ago(2), closes: ahead(0.8) }, [
    { name: "commitcal", commits: 94, oneliner: "Your GitHub graph as a wall calendar", votes: 82 },
    { name: "shelfie", commits: 51, oneliner: "Bookshelf photo in, Goodreads import out", votes: 41 },
    { name: "pagepal", commits: 33, oneliner: "Read-later app that emails one article a day", votes: 19 },
  ], [
    ["mara", "commitcal", "80% done and it makes a good gift. Ship it before the holidays."],
    ["devonk", "shelfie", "Most useful one, but the OCR will eat your whole month."],
    ["nadia", "commitcal", "I'd buy one for my team."],
  ]);

  // Shipped history for the leaderboards.
  const shipped: [string, string, string, number, number][] = [
    ["nadia", "receiptly", "Snap a receipt, get a categorized expense", 9, 40],
    ["oskar", "tabhoarder", "Save and search every tab you close", 14, 60],
    ["you", "envy", "Sync .env files across machines", 17, 45],
    ["priya", "standup.fm", "Async standups as a two-minute podcast", 21, 70],
    ["lenhart", "gridnote", "Notes that snap to a spreadsheet grid", 30, 90],
  ];
  const voterPicks = ["mara", "devonk", "nadia", "oskar", "r0b"];
  for (const [owner, name, line, days, startedAgo] of shipped) {
    const c = await campaign(owner, owner === "you" ? "CLI tools: which one is worth it?" : `${owner}'s side projects`, { created: ago(startedAgo + 3), closes: ago(startedAgo) }, [
      { name, commits: 120, oneliner: line, votes: 38 },
      { name: name === "envy" ? "loggle" : `${name}-lite`, commits: 40, oneliner: name === "envy" ? "Tail logs from three servers in one pane" : "A smaller spin-off", votes: 25 },
    ], voterPicks.slice(0, 5 - shipped.findIndex((s) => s[1] === name)).map((h) => [h, name, "This one."] as [string, string, string]));
    const win = c.projects.find((p) => p.name === name)!;
    await db.commitment.create({ data: { campaignId: c.id, projectId: win.id, createdAt: ago(startedAgo) } });
    await db.campaign.update({ where: { id: c.id }, data: { shippedProjectId: win.id, shippedAt: ago(startedAgo - days) } });
  }
  console.log("Seeded. Log in as you@example.com / password123");
}

main().finally(() => db.$disconnect());
