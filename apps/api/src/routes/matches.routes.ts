import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { MatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const matchesRouter = Router();

matchesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = z
      .object({
        round: z.string().optional(),
      })
      .parse(req.query);

    const upcomingRaw = req.query.upcoming;
    const upcomingFilter =
      upcomingRaw === "true"
        ? true
        : upcomingRaw === "false"
          ? false
          : undefined;

    const leagueId = env.API_FOOTBALL_LEAGUE_ID;
    const season = env.API_FOOTBALL_SEASON;

    const where: Prisma.MatchWhereInput = {
      leagueId,
      season,
    };

    if (query.round) {
      where.roundLabel = query.round;
    }

    if (upcomingFilter === true) {
      where.status = {
        in: [MatchStatus.NS, MatchStatus.LIVE, MatchStatus.HT],
      };
    }

    const matches = await prisma.match.findMany({
      where,
      orderBy: { kickoffUtc: "asc" },
    });

    const distinctRounds = await prisma.match.findMany({
      where: { leagueId, season },
      select: { roundLabel: true },
      distinct: ["roundLabel"],
      orderBy: { roundLabel: "asc" },
    });

    res.json({
      rounds: distinctRounds.map((r) => r.roundLabel),
      matches,
    });
  }),
);

matchesRouter.get(
  "/current-round",
  asyncHandler(async (_req, res) => {
    const leagueId = env.API_FOOTBALL_LEAGUE_ID;
    const season = env.API_FOOTBALL_SEASON;
    const now = new Date();

    const upcoming = await prisma.match.findFirst({
      where: {
        leagueId,
        season,
        kickoffUtc: { gte: now },
        status: MatchStatus.NS,
      },
      orderBy: { kickoffUtc: "asc" },
    });

    const label =
      upcoming?.roundLabel ??
      (
        await prisma.match.findFirst({
          where: { leagueId, season },
          orderBy: { kickoffUtc: "desc" },
        })
      )?.roundLabel;

    res.json({ currentRoundLabel: label ?? null });
  }),
);
