import { MatchStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

function outcome(home: number, away: number): "HOME" | "AWAY" | "DRAW" {
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

export async function lockPredictionsForStartedMatches(): Promise<number> {
  const now = new Date();
  const live = await prisma.match.findMany({
    where: {
      kickoffUtc: { lte: now },
      status: { in: [MatchStatus.NS, MatchStatus.LIVE, MatchStatus.HT] },
    },
    select: { id: true, status: true },
  });
  let updated = 0;
  for (const m of live) {
    const preds = await prisma.prediction.findMany({
      where: { matchId: m.id, lockedAt: null },
    });
    if (!preds.length) continue;
    await prisma.prediction.updateMany({
      where: { matchId: m.id, lockedAt: null },
      data: { lockedAt: now },
    });
    updated += preds.length;
  }
  return updated;
}

export async function scoreFinishedMatches(): Promise<{
  predictionsScored: number;
}> {
  const finished = await prisma.match.findMany({
    where: {
      status: MatchStatus.FT,
      homeGoals: { not: null },
      awayGoals: { not: null },
    },
    select: {
      id: true,
      homeGoals: true,
      awayGoals: true,
    },
  });

  let predictionsScored = 0;

  for (const m of finished) {
    const hg = m.homeGoals!;
    const ag = m.awayGoals!;
    const preds = await prisma.prediction.findMany({
      where: { matchId: m.id, pointsEarned: null },
    });
    if (!preds.length) continue;

    const actualOutcome = outcome(hg, ag);

    for (const p of preds) {
      const predOutcome = outcome(p.predHome, p.predAway);
      let pts = 0;
      if (p.predHome === hg && p.predAway === ag) {
        pts = 3;
      } else if (predOutcome === actualOutcome) {
        pts = 1;
      }

      await prisma.$transaction(async (tx) => {
        await tx.prediction.update({
          where: { id: p.id },
          data: {
            pointsEarned: pts,
            scoredAt: new Date(),
          },
        });

        const stats = await tx.userStats.findUnique({
          where: { userId: p.userId },
        });
        if (!stats) {
          await tx.userStats.create({
            data: {
              userId: p.userId,
              totalPoints: pts,
              exactMatches: pts === 3 ? 1 : 0,
              winnerHits: pts >= 1 ? 1 : 0,
              currentStreak: pts >= 1 ? 1 : 0,
              bestStreak: pts >= 1 ? 1 : 0,
            },
          });
        } else {
          const exactMatches = stats.exactMatches + (pts === 3 ? 1 : 0);
          const winnerHits = stats.winnerHits + (pts >= 1 ? 1 : 0);
          const streak =
            pts >= 1 ? stats.currentStreak + 1 : 0;
          const bestStreak = Math.max(stats.bestStreak, streak);
          await tx.userStats.update({
            where: { userId: p.userId },
            data: {
              totalPoints: stats.totalPoints + pts,
              exactMatches,
              winnerHits,
              currentStreak: streak,
              bestStreak,
            },
          });
        }
      });
      predictionsScored += 1;
    }
  }

  return { predictionsScored };
}
