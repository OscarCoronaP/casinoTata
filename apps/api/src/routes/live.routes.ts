import { Router } from "express";
import { MatchStatus } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const liveRouter = Router();

liveRouter.get(
  "/matches",
  asyncHandler(async (_req, res) => {
    const leagueId = env.API_FOOTBALL_LEAGUE_ID;
    const season = env.API_FOOTBALL_SEASON;

    const matches = await prisma.match.findMany({
      where: {
        leagueId,
        season,
        status: { in: [MatchStatus.LIVE, MatchStatus.HT] },
      },
      orderBy: { kickoffUtc: "asc" },
    });

    res.json(matches);
  }),
);
