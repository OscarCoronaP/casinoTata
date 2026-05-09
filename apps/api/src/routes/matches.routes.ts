import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { MatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toMatchPayload } from "../utils/matchDto.js";

const matchInclude = {
  round: true,
  homeTeam: true,
  awayTeam: true,
} as const;

export const matchesRouter = Router();

matchesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = z
      .object({
        roundId: z.string().cuid().optional(),
      })
      .parse(req.query);

    const upcomingRaw = req.query.upcoming;
    const upcomingFilter =
      upcomingRaw === "true"
        ? true
        : upcomingRaw === "false"
          ? false
          : undefined;

    const where: Prisma.MatchWhereInput = {};

    if (query.roundId) {
      where.roundId = query.roundId;
    }

    if (upcomingFilter === true) {
      where.status = {
        in: [MatchStatus.NS, MatchStatus.LIVE, MatchStatus.HT],
      };
    }

    const matchesRaw = await prisma.match.findMany({
      where,
      include: matchInclude,
      orderBy: { kickoffUtc: "asc" },
    });

    const rounds = await prisma.round.findMany({
      orderBy: [{ sortOrder: "desc" }, { startDate: "desc" }],
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    res.json({
      rounds: rounds.map((r) => ({
        id: r.id,
        name: r.name,
        isActive: r.isActive,
      })),
      matches: matchesRaw.map(toMatchPayload),
    });
  }),
);

matchesRouter.get(
  "/current-round",
  asyncHandler(async (_req, res) => {
    const now = new Date();

    const upcoming = await prisma.match.findFirst({
      where: {
        kickoffUtc: { gte: now },
        status: MatchStatus.NS,
      },
      include: { round: true },
      orderBy: { kickoffUtc: "asc" },
    });

    const label =
      upcoming?.round.name ??
      (
        await prisma.match.findFirst({
          orderBy: { kickoffUtc: "desc" },
          include: { round: true },
        })
      )?.round.name;

    const roundId = upcoming?.roundId ?? null;

    res.json({ currentRoundLabel: label ?? null, roundId });
  }),
);
