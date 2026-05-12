import { Router } from "express";
import { z } from "zod";
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

/**
 * Ranking de la jornada (round) indicada en `?roundId=`.
 * Si no se manda `roundId`, se elige automáticamente:
 *   1. La jornada del partido con la predicción calificada más reciente.
 *   2. Como respaldo, la jornada más reciente por `sortOrder`/`startDate`.
 *
 * Suma `pointsEarned` y cuenta resultados exactos / ganador acertado por
 * usuario, considerando únicamente predicciones ya calificadas dentro de la
 * jornada seleccionada.
 */
leaderboardRouter.get(
  "/by-round",
  asyncHandler(async (req, res) => {
    const query = z
      .object({ roundId: z.string().min(1).optional() })
      .parse(req.query);

    let selectedRoundId = query.roundId;

    if (!selectedRoundId) {
      const latestScored = await prisma.prediction.findFirst({
        where: {
          pointsEarned: { not: null },
          match: { round: { isActive: true } },
        },
        orderBy: { scoredAt: "desc" },
        select: { match: { select: { roundId: true } } },
      });
      selectedRoundId = latestScored?.match.roundId;
    }

    if (!selectedRoundId) {
      const fallback = await prisma.round.findFirst({
        where: { isActive: true },
        orderBy: [{ sortOrder: "desc" }, { startDate: "desc" }],
        select: { id: true },
      });
      selectedRoundId = fallback?.id;
    }

    if (!selectedRoundId) {
      res.json({ round: null, rows: [] });
      return;
    }

    const round = await prisma.round.findUnique({
      where: { id: selectedRoundId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },
    });

    if (!round || !round.isActive) {
      res.json({ round: null, rows: [] });
      return;
    }

    const preds = await prisma.prediction.findMany({
      where: {
        pointsEarned: { not: null },
        match: { roundId: selectedRoundId },
      },
      select: {
        userId: true,
        pointsEarned: true,
      },
    });

    type Aggregate = {
      points: number;
      exactMatches: number;
      winnerHits: number;
      predictionsResolved: number;
    };
    const byUser = new Map<string, Aggregate>();
    for (const p of preds) {
      const cur = byUser.get(p.userId) ?? {
        points: 0,
        exactMatches: 0,
        winnerHits: 0,
        predictionsResolved: 0,
      };
      const pts = p.pointsEarned ?? 0;
      cur.points += pts;
      if (pts === 3) cur.exactMatches += 1;
      if (pts >= 1) cur.winnerHits += 1;
      cur.predictionsResolved += 1;
      byUser.set(p.userId, cur);
    }

    const userIds = [...byUser.keys()];
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, nickname: true, avatarUrl: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const rows = userIds
      .map((userId) => {
        const agg = byUser.get(userId)!;
        const user = userMap.get(userId);
        return {
          userId,
          displayName: user?.nickname || user?.name || "—",
          avatarUrl: user?.avatarUrl ?? null,
          points: agg.points,
          exactMatches: agg.exactMatches,
          winnerHits: agg.winnerHits,
          predictionsResolved: agg.predictionsResolved,
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.exactMatches !== a.exactMatches)
          return b.exactMatches - a.exactMatches;
        return b.winnerHits - a.winnerHits;
      })
      .map((row, idx) => ({ rank: idx + 1, ...row }));

    res.json({
      round: {
        id: round.id,
        name: round.name,
        startDate: round.startDate.toISOString(),
        endDate: round.endDate.toISOString(),
        isActive: round.isActive,
      },
      rows,
    });
  }),
);
