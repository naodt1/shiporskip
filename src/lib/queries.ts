import "server-only";
import { db } from "./db";

export const DEFAULT_TITLE = "Which one should I finish?";
const DAY = 86_400_000;

export type Sort = "hot" | "new" | "ending";

const isOpen = (c: { status: string; closesAt: Date }, now: Date) => c.status === "open" && c.closesAt > now;
const boosted = (c: { boostedUntil: Date | null }, now: Date) => !!c.boostedUntil && c.boostedUntil > now;

async function voteCounts(campaignIds: string[]) {
  const rows = await db.vote.groupBy({ by: ["projectId"], where: { campaignId: { in: campaignIds } }, _count: true });
  return new Map(rows.map((r) => [r.projectId, r._count]));
}

export type FeedItem = {
  id: string;
  handle: string;
  avatarUrl: string | null;
  title: string;
  closesAt: string;
  boosted: boolean;
  total: number;
  count: number;
  voted: boolean;
  own: boolean;
  thumbs: { name: string; imageUrl: string | null }[];
};

export async function getFeed(sort: Sort, userId: string | null, limit = 50): Promise<FeedItem[]> {
  const now = new Date();
  const rows = await db.campaign.findMany({
    where: { status: "open", closesAt: { gt: now } },
    include: {
      user: { select: { handle: true, avatarUrl: true } },
      projects: { select: { name: true, imageUrl: true }, orderBy: { position: "asc" } },
      _count: { select: { votes: true } },
    },
    orderBy: sort === "ending" ? { closesAt: "asc" } : { createdAt: "desc" },
    take: sort === "hot" ? 200 : limit,
  });
  const mine = userId
    ? new Set((await db.vote.findMany({ where: { userId, campaignId: { in: rows.map((r) => r.id) } }, select: { campaignId: true } })).map((v) => v.campaignId))
    : new Set<string>();

  let items = rows.map((c) => ({
    id: c.id,
    handle: c.user.handle,
    avatarUrl: c.user.avatarUrl,
    title: c.title || DEFAULT_TITLE,
    closesAt: c.closesAt.toISOString(),
    boosted: boosted(c, now),
    total: c._count.votes,
    count: c.projects.length,
    own: c.userId === userId,
    voted: c.userId === userId || mine.has(c.id),
    thumbs: c.projects,
  }));
  if (sort === "hot") items = items.sort((a, b) => Number(b.boosted) - Number(a.boosted) || b.total - a.total).slice(0, limit);
  return items;
}

export type CampaignProject = {
  id: string;
  name: string;
  oneliner: string;
  repoFullName: string;
  commits: number;
  imageUrl: string | null;
  offer: string | null;
  hasCode: boolean;
  /** Only present for voters and the owner. */
  promoCode: string | null;
  votes: number;
};

export type CampaignDetail = {
  id: string;
  handle: string;
  title: string;
  closesAt: string;
  open: boolean;
  own: boolean;
  total: number;
  myProjectId: string | null;
  reasonSent: boolean;
  projects: CampaignProject[];
};

export async function getCampaign(id: string, userId: string | null): Promise<CampaignDetail | null> {
  const c = await db.campaign.findUnique({
    where: { id },
    include: { user: { select: { handle: true } }, projects: { orderBy: { position: "asc" } } },
  });
  if (!c) return null;
  const counts = await voteCounts([c.id]);
  const my = userId ? await db.vote.findUnique({ where: { userId_campaignId: { userId, campaignId: c.id } } }) : null;
  const own = c.userId === userId;
  const reveal = own || !!my; // never send promo codes to people who haven't voted
  return {
    id: c.id,
    handle: c.user.handle,
    title: c.title || DEFAULT_TITLE,
    closesAt: c.closesAt.toISOString(),
    open: isOpen(c, new Date()),
    own,
    total: [...counts.values()].reduce((a, b) => a + b, 0),
    myProjectId: my?.projectId ?? null,
    reasonSent: !!my?.reason,
    projects: c.projects.map((p) => ({
      id: p.id,
      name: p.name,
      oneliner: p.oneliner,
      repoFullName: p.repoFullName,
      commits: p.commits,
      imageUrl: p.imageUrl,
      offer: p.offer,
      hasCode: !!p.promoCode,
      promoCode: reveal ? p.promoCode : null,
      votes: counts.get(p.id) ?? 0,
    })),
  };
}

export type MyCampaign = {
  id: string;
  title: string;
  closesAt: string;
  open: boolean;
  boosted: boolean;
  total: number;
  shipped: string | null;
  committedProjectId: string | null;
  results: { id: string; name: string; votes: number }[];
  reasons: { handle: string; project: string; text: string }[];
};

export async function getMyCampaigns(userId: string): Promise<MyCampaign[]> {
  const now = new Date();
  const rows = await db.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      projects: { orderBy: { position: "asc" } },
      commitment: true,
      votes: { where: { reason: { not: null } }, orderBy: { updatedAt: "desc" }, include: { user: { select: { handle: true } } } },
    },
  });
  const counts = await voteCounts(rows.map((r) => r.id));
  return rows.map((c) => {
    const names = new Map(c.projects.map((p) => [p.id, p.name]));
    const results = c.projects.map((p) => ({ id: p.id, name: p.name, votes: counts.get(p.id) ?? 0 })).sort((a, b) => b.votes - a.votes);
    return {
      id: c.id,
      title: c.title || DEFAULT_TITLE,
      closesAt: c.closesAt.toISOString(),
      open: isOpen(c, now),
      boosted: boosted(c, now),
      total: results.reduce((a, r) => a + r.votes, 0),
      shipped: c.shippedProjectId ? names.get(c.shippedProjectId) ?? null : null,
      committedProjectId: c.commitment?.projectId ?? null,
      results,
      reasons: c.votes.map((v) => ({ handle: v.user.handle, project: names.get(v.projectId) ?? "", text: v.reason! })),
    };
  });
}

export type BoardRow = { title: string; sub: string; stat: string };
export type Board = "shipped" | "projects" | "voters";

export async function getShippedBoard(limit = 20): Promise<(BoardRow & { days: number })[]> {
  const rows = await db.campaign.findMany({
    where: { shippedProjectId: { not: null }, shippedAt: { not: null } },
    include: { user: { select: { handle: true } }, commitment: true, projects: { select: { id: true, name: true } } },
  });
  return rows
    .map((c) => {
      const start = c.commitment?.createdAt ?? c.createdAt;
      const days = Math.max(1, Math.round((c.shippedAt!.getTime() - start.getTime()) / DAY));
      const name = c.projects.find((p) => p.id === c.shippedProjectId)?.name ?? "";
      return { title: name, sub: "@" + c.user.handle, stat: `${days} day${days === 1 ? "" : "s"}`, days };
    })
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);
}

export async function getBoard(board: Board): Promise<BoardRow[]> {
  if (board === "shipped") return getShippedBoard();

  if (board === "projects") {
    const now = new Date();
    const rows = await db.project.findMany({
      where: { campaign: { status: "open", closesAt: { gt: now }, createdAt: { gt: new Date(now.getTime() - 7 * DAY) } } },
      include: { campaign: { select: { user: { select: { handle: true } } } }, _count: { select: { votes: true } } },
      orderBy: { votes: { _count: "desc" } },
      take: 20,
    });
    return rows.map((p) => ({ title: p.name, sub: "@" + p.campaign.user.handle, stat: `${p._count.votes} votes` }));
  }

  // Top voters: people whose pick went on to ship.
  const shipped = await db.campaign.findMany({ where: { shippedProjectId: { not: null } }, select: { id: true, shippedProjectId: true } });
  const hits = await db.vote.groupBy({
    by: ["userId"],
    where: { OR: shipped.map((c) => ({ campaignId: c.id, projectId: c.shippedProjectId! })) },
    _count: true,
    orderBy: { _count: { userId: "desc" } },
    take: 20,
  });
  if (!shipped.length) return [];
  const users = new Map((await db.user.findMany({ where: { id: { in: hits.map((h) => h.userId) } }, select: { id: true, handle: true } })).map((u) => [u.id, u.handle]));
  return hits.map((h) => ({ title: "@" + users.get(h.userId), sub: "", stat: `${h._count} shipped` }));
}

export async function getTopBuilders(n = 5) {
  const rows = await db.campaign.groupBy({
    by: ["userId"],
    where: { shippedProjectId: { not: null } },
    _count: true,
    orderBy: { _count: { userId: "desc" } },
    take: n,
  });
  let ids = rows.map((r) => r.userId);
  if (ids.length < n) {
    const more = await db.campaign.groupBy({ by: ["userId"], _count: true, orderBy: { _count: { userId: "desc" } }, take: n * 2 });
    ids = [...new Set([...ids, ...more.map((r) => r.userId)])].slice(0, n);
  }
  const users = await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, handle: true, avatarUrl: true } });
  return ids.map((id) => users.find((u) => u.id === id)!).filter(Boolean);
}
