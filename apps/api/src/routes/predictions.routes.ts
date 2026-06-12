import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toMatchPayload } from "../utils/matchDto.js";
import {
  isRoundPredictionWindowClosed,
  isRoundPredictionsPubliclyVisible,
} from "../config/predictionWindow.js";

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
      include: { round: { select: { isActive: true } } },
    });
    if (!match) throw new HttpError(404, "Partido no encontrado");
    if (!match.round.isActive) {
      throw new HttpError(400, "La jornada de este partido está inactiva.");
    }

    const firstMatchOfRound = await prisma.match.findFirst({
      where: { roundId: match.roundId },
      orderBy: { kickoffUtc: "asc" },
      select: { kickoffUtc: true },
    });

    const now = new Date();
    if (
      firstMatchOfRound &&
      isRoundPredictionWindowClosed(firstMatchOfRound.kickoffUtc, now)
    ) {
      throw new HttpError(
        400,
        "Ventana cerrada: sólo hasta 2 min antes del primer partido de la jornada.",
      );
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
      include: {
        match: { include: { round: true, homeTeam: true, awayTeam: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(
      preds.map((p) => ({
        id: p.id,
        matchId: p.matchId,
        predHome: p.predHome,
        predAway: p.predAway,
        lockedAt: p.lockedAt?.toISOString() ?? null,
        pointsEarned: p.pointsEarned,
        match: toMatchPayload(p.match),
      })),
    );
  }),
);

/**
 * Pronósticos de un usuario en una jornada. Requiere sesión.
 * Sólo se devuelven marcadores si ya pasó el kick-off del primer partido
 * de la jornada, salvo que el solicitante sea el mismo usuario.
 */
predictionsRouter.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    const userId = z.string().cuid().parse(req.params.userId);
    const query = z
      .object({ roundId: z.string().min(1) })
      .parse(req.query);

    const viewerId = req.user!.id;

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, nickname: true },
    });
    if (!target) throw new HttpError(404, "Usuario no encontrado");

    const round = await prisma.round.findFirst({
      where: { id: query.roundId, isActive: true },
      select: { id: true, name: true },
    });
    if (!round) throw new HttpError(404, "Jornada no encontrada o inactiva");

    const firstMatch = await prisma.match.findFirst({
      where: { roundId: round.id },
      orderBy: { kickoffUtc: "asc" },
      select: { kickoffUtc: true },
    });

    const now = new Date();
    const isSelf = viewerId === userId;
    const canShowScores =
      isSelf ||
      (firstMatch != null &&
        isRoundPredictionsPubliclyVisible(firstMatch.kickoffUtc, now));

    if (!canShowScores) {
      throw new HttpError(
        403,
        "Los pronósticos de otros usuarios estarán disponibles cuando comience el primer partido de esta jornada.",
      );
    }

    const matches = await prisma.match.findMany({
      where: { roundId: round.id },
      orderBy: { kickoffUtc: "asc" },
      include: {
        round: true,
        homeTeam: true,
        awayTeam: true,
        predictions: {
          where: { userId },
          take: 1,
        },
      },
    });

    res.json({
      round: { id: round.id, name: round.name },
      displayName: target.nickname || target.name,
      rows: matches.map((m) => {
        const p = m.predictions[0];
        return {
          matchId: m.id,
          predHome: p?.predHome ?? null,
          predAway: p?.predAway ?? null,
          lockedAt: p?.lockedAt?.toISOString() ?? null,
          pointsEarned: p?.pointsEarned ?? null,
          hasPrediction: Boolean(p),
          match: toMatchPayload(m),
        };
      }),
    });
  }),
);
