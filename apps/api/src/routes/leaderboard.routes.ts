import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const leaderboardRouter = Router();

leaderboardRouter.get(
  "/global",
  asyncHandler(async (_req, res) => {
    const statsRows = await prisma.userStats.findMany({
      orderBy: { totalPoints: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    });

    const ranked = statsRows.map((s, idx) => ({
      rank: idx + 1,
      userId: s.userId,
      displayName: s.user.nickname || s.user.name,
      avatarUrl: s.user.avatarUrl,
      totalPoints: s.totalPoints,
      exactMatches: s.exactMatches,
      winnerHits: s.winnerHits,
      currentStreak: s.currentStreak,
      bestStreak: s.bestStreak,
    }));

    res.json(ranked);
  }),
);

leaderboardRouter.get(
  "/weekly",
  asyncHandler(async (_req, res) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const grouped = await prisma.prediction.groupBy({
      by: ["userId"],
      where: {
        scoredAt: { gte: since },
        pointsEarned: { not: null },
      },
      _sum: { pointsEarned: true },
      _count: true,
    });

    const ids = grouped.map((g) => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, nickname: true, avatarUrl: true },
    });
    const map = new Map(users.map((u) => [u.id, u]));

    const sorted = grouped
      .map((g) => ({
        userId: g.userId,
        displayName: map.get(g.userId)?.nickname || map.get(g.userId)?.name,
        avatarUrl: map.get(g.userId)?.avatarUrl,
        weeklyPoints: g._sum.pointsEarned ?? 0,
        predictionsResolved: g._count,
      }))
      .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
      .slice(0, 50)
      .map((row, idx) => ({ rank: idx + 1, ...row }));

    res.json(sorted);
  }),
);
