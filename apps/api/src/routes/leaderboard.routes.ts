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
 * Tabla única de la jornada: todos los jugadores con al menos un pronóstico
 * guardado en la ronda, ordenados por puntos de la jornada (cuando ya hay
 * partidos calificados). Incluye `predictionsCount` / `matchCount` y metadatos
 * para la UI (kick-off del primer partido).
 *
 * Si no se manda `roundId`, se elige automáticamente:
 *   1. La jornada del partido con la predicción calificada más reciente.
 *   2. Como respaldo, la jornada más reciente por `sortOrder`/`startDate`.
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

    const firstMatch = await prisma.match.findFirst({
      where: { roundId: selectedRoundId },
      orderBy: { kickoffUtc: "asc" },
      select: { kickoffUtc: true },
    });

    const matchCount = await prisma.match.count({
      where: { roundId: selectedRoundId },
    });

    const allPreds = await prisma.prediction.findMany({
      where: { match: { roundId: selectedRoundId } },
      select: {
        userId: true,
        pointsEarned: true,
      },
    });

    type ScoredAgg = {
      points: number;
      exactMatches: number;
      winnerHits: number;
      predictionsResolved: number;
    };

    const predictionsCountByUser = new Map<string, number>();
    const scoredByUser = new Map<string, ScoredAgg>();

    for (const p of allPreds) {
      predictionsCountByUser.set(
        p.userId,
        (predictionsCountByUser.get(p.userId) ?? 0) + 1,
      );
      if (p.pointsEarned == null) continue;
      const cur = scoredByUser.get(p.userId) ?? {
        points: 0,
        exactMatches: 0,
        winnerHits: 0,
        predictionsResolved: 0,
      };
      const pts = p.pointsEarned;
      cur.points += pts;
      if (pts === 3) cur.exactMatches += 1;
      if (pts >= 1) cur.winnerHits += 1;
      cur.predictionsResolved += 1;
      scoredByUser.set(p.userId, cur);
    }

    const userIds = [...predictionsCountByUser.keys()];
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, nickname: true, avatarUrl: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const emptyScored: ScoredAgg = {
      points: 0,
      exactMatches: 0,
      winnerHits: 0,
      predictionsResolved: 0,
    };

    const rows = userIds
      .map((userId) => {
        const agg = scoredByUser.get(userId) ?? emptyScored;
        const u = userMap.get(userId);
        return {
          userId,
          displayName: u?.nickname || u?.name || "—",
          avatarUrl: u?.avatarUrl ?? null,
          predictionsCount: predictionsCountByUser.get(userId) ?? 0,
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
        if (b.winnerHits !== a.winnerHits) return b.winnerHits - a.winnerHits;
        if (b.predictionsResolved !== a.predictionsResolved)
          return b.predictionsResolved - a.predictionsResolved;
        if (b.predictionsCount !== a.predictionsCount)
          return b.predictionsCount - a.predictionsCount;
        return a.displayName.localeCompare(b.displayName, "es");
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
      firstKickoffUtc: firstMatch?.kickoffUtc.toISOString() ?? null,
      matchCount,
      rows,
    });
  }),
);
