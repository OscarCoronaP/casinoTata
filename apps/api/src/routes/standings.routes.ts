import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const standingsRouter = Router();

standingsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const leagueId = env.API_FOOTBALL_LEAGUE_ID;
    const season = env.API_FOOTBALL_SEASON;

    const rows = await prisma.standingRow.findMany({
      where: { leagueId, season },
      orderBy: { rank: "asc" },
    });

    res.json(rows);
  }),
);
