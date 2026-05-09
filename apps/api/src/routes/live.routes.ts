import { Router } from "express";
import { MatchStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toMatchPayload } from "../utils/matchDto.js";

export const liveRouter = Router();

liveRouter.get(
  "/matches",
  asyncHandler(async (_req, res) => {
    const matchesRaw = await prisma.match.findMany({
      where: {
        status: { in: [MatchStatus.LIVE, MatchStatus.HT] },
      },
      include: {
        round: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { kickoffUtc: "asc" },
    });

    res.json(matchesRaw.map(toMatchPayload));
  }),
);
