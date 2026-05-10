import { MatchStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { PREDICTION_CLOSE_BEFORE_MS } from "../config/predictionWindow.js";

function outcome(home: number, away: number): "HOME" | "AWAY" | "DRAW" {
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

/**
 * Bloquea TODAS las predicciones de una jornada cuando el partido más temprano
 * de esa ronda está a `PREDICTION_CLOSE_BEFORE_MS` (o menos) de comenzar.
 */
export async function lockPredictionsForStartedMatches(): Promise<number> {
  const now = new Date();
  const threshold = new Date(now.getTime() + PREDICTION_CLOSE_BEFORE_MS);

  const rounds = await prisma.round.findMany({
    select: {
      id: true,
      matches: {
        orderBy: { kickoffUtc: "asc" },
        take: 1,
        select: { kickoffUtc: true },
      },
    },
  });

  const lockableRoundIds = rounds
    .filter(
      (r) =>
        r.matches[0] &&
        r.matches[0].kickoffUtc.getTime() <= threshold.getTime(),
    )
    .map((r) => r.id);

  if (lockableRoundIds.length === 0) return 0;

  const result = await prisma.prediction.updateMany({
    where: {
      lockedAt: null,
      match: { roundId: { in: lockableRoundIds } },
    },
    data: { lockedAt: now },
  });
  return result.count;
}

async function rebuildUserStatsFromPredictions(): Promise<void> {
  await prisma.userStats.deleteMany();
  const users = await prisma.user.findMany({ select: { id: true } });

  for (const { id: userId } of users) {
    const predsAsc = await prisma.prediction.findMany({
      where: { userId, pointsEarned: { not: null } },
      include: { match: true },
      orderBy: { match: { kickoffUtc: "asc" } },
    });
    if (predsAsc.length === 0) continue;

    let totalPoints = 0;
    let exactMatches = 0;
    let winnerHits = 0;
    let run = 0;
    let bestStreak = 0;
    for (const p of predsAsc) {
      const pts = p.pointsEarned ?? 0;
      totalPoints += pts;
      if (pts === 3) exactMatches++;
      if (pts >= 1) {
        winnerHits++;
        run++;
        bestStreak = Math.max(bestStreak, run);
      } else {
        run = 0;
      }
    }

    const predsDesc = [...predsAsc].sort(
      (a, b) => b.match.kickoffUtc.getTime() - a.match.kickoffUtc.getTime(),
    );
    let currentStreak = 0;
    for (const p of predsDesc) {
      if ((p.pointsEarned ?? 0) >= 1) currentStreak++;
      else break;
    }

    await prisma.userStats.create({
      data: {
        userId,
        totalPoints,
        exactMatches,
        winnerHits,
        currentStreak,
        bestStreak,
      },
    });
  }
}

/**
 * Recalcula puntos de todas las predicciones de partidos FT y reconstruye el leaderboard.
 * Idempotente y segura si el admin corrige un marcador.
 */
export async function reconcileScoresAndLeaderboard(): Promise<{
  predictionsUpdated: number;
}> {
  const finished = await prisma.match.findMany({
    where: {
      status: MatchStatus.FT,
      homeGoals: { not: null },
      awayGoals: { not: null },
    },
    select: { id: true, homeGoals: true, awayGoals: true },
  });

  let predictionsUpdated = 0;

  for (const m of finished) {
    const hg = m.homeGoals!;
    const ag = m.awayGoals!;
    const actualOutcome = outcome(hg, ag);
    const preds = await prisma.prediction.findMany({ where: { matchId: m.id } });

    for (const p of preds) {
      let pts = 0;
      if (p.predHome === hg && p.predAway === ag) pts = 3;
      else if (outcome(p.predHome, p.predAway) === actualOutcome) pts = 1;

      await prisma.prediction.update({
        where: { id: p.id },
        data: {
          pointsEarned: pts,
          scoredAt: new Date(),
        },
      });
      predictionsUpdated += 1;
    }
  }

  await rebuildUserStatsFromPredictions();
  return { predictionsUpdated };
}
