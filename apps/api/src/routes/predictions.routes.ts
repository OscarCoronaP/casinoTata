import { Router } from "express";
import { MatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const predictionsRouter = Router();

predictionsRouter.use(requireAuth);

predictionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        matchId: z.string().cuid(),
        predHome: z.coerce.number().int().min(0).max(20),
        predAway: z.coerce.number().int().min(0).max(20),
      })
      .parse(req.body);

    const match = await prisma.match.findUnique({
      where: { id: body.matchId },
    });
    if (!match) throw new HttpError(404, "Partido no encontrado");

    const now = new Date();
    if (match.kickoffUtc <= now || match.status !== MatchStatus.NS) {
      throw new HttpError(400, "El partido ya inició; predicción cerrada");
    }

    const pred = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: req.user!.id,
          matchId: match.id,
        },
      },
      create: {
        userId: req.user!.id,
        matchId: match.id,
        predHome: body.predHome,
        predAway: body.predAway,
      },
      update: {
        predHome: body.predHome,
        predAway: body.predAway,
      },
    });

    res.json(pred);
  }),
);

predictionsRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const preds = await prisma.prediction.findMany({
      where: { userId: req.user!.id },
      include: { match: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(preds);
  }),
);
