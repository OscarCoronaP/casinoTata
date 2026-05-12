import { Router } from "express";
import { MatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  lockPredictionsForStartedMatches,
  reconcileScoresAndLeaderboard,
} from "../services/scoring.service.js";
import { toMatchPayload } from "../utils/matchDto.js";
import { createUserAsAdmin } from "../services/auth.service.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

const adminCreateUserBody = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{8,14}$/, "Teléfono en formato E.164 (+52...)"),
  name: z.string().min(2).max(80),
  nickname: z.string().max(32).optional().nullable(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

adminRouter.post(
  "/users",
  asyncHandler(async (req, res) => {
    const body = adminCreateUserBody.parse(req.body);
    const nickname =
      body.nickname === undefined || body.nickname === null
        ? null
        : body.nickname.trim() === ""
          ? null
          : body.nickname.trim();

    const result = await createUserAsAdmin({
      phone: body.phone,
      name: body.name,
      nickname,
      role: body.role,
    });
    res.status(201).json(result);
  }),
);

const roundBody = z.object({
  name: z.string().trim().min(1).max(160),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

/** Listado completo de jornadas (activas e inactivas) para el panel admin. */
adminRouter.get(
  "/rounds",
  asyncHandler(async (_req, res) => {
    const rounds = await prisma.round.findMany({
      orderBy: [{ sortOrder: "desc" }, { startDate: "desc" }],
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
        sortOrder: true,
        _count: { select: { matches: true } },
      },
    });
    res.json(
      rounds.map((r) => ({
        id: r.id,
        name: r.name,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        isActive: r.isActive,
        sortOrder: r.sortOrder,
        matchCount: r._count.matches,
      })),
    );
  }),
);

adminRouter.post(
  "/rounds",
  asyncHandler(async (req, res) => {
    const body = roundBody.parse(req.body);
    if (body.endDate < body.startDate) {
      throw new HttpError(400, "La fecha fin debe ser posterior al inicio");
    }
    const round = await prisma.round.create({
      data: {
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    res.status(201).json(round);
  }),
);

adminRouter.patch(
  "/rounds/:id",
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const body = roundBody.partial().parse(req.body);
    if (body.startDate && body.endDate && body.endDate < body.startDate) {
      throw new HttpError(400, "La fecha fin debe ser posterior al inicio");
    }
    try {
      const round = await prisma.round.update({
        where: { id },
        data: body,
      });
      res.json(round);
    } catch {
      throw new HttpError(404, "Jornada no encontrada");
    }
  }),
);

adminRouter.delete(
  "/rounds/:id",
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    await prisma.round.delete({ where: { id } });
    res.status(204).send();
  }),
);

const matchBody = z.object({
  roundId: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  kickoffUtc: z.coerce.date(),
  stadium: z.string().trim().max(200).optional().nullable(),
});

adminRouter.post(
  "/matches",
  asyncHandler(async (req, res) => {
    const body = matchBody.parse(req.body);
    if (body.homeTeamId === body.awayTeamId) {
      throw new HttpError(400, "Local y visitante deben ser distintos");
    }
    const round = await prisma.round.findUnique({ where: { id: body.roundId } });
    if (!round) throw new HttpError(404, "Jornada no encontrada");
    const [h, a] = await Promise.all([
      prisma.team.findUnique({ where: { id: body.homeTeamId } }),
      prisma.team.findUnique({ where: { id: body.awayTeamId } }),
    ]);
    if (!h || !a) throw new HttpError(404, "Equipo no encontrado");

    const match = await prisma.match.create({
      data: {
        roundId: body.roundId,
        homeTeamId: body.homeTeamId,
        awayTeamId: body.awayTeamId,
        kickoffUtc: body.kickoffUtc,
        stadium: body.stadium ?? null,
      },
      include: { round: true, homeTeam: true, awayTeam: true },
    });
    res.status(201).json(toMatchPayload(match));
  }),
);

adminRouter.patch(
  "/matches/:id",
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const body = matchBody.partial().parse(req.body);
    if (
      body.homeTeamId &&
      body.awayTeamId &&
      body.homeTeamId === body.awayTeamId
    ) {
      throw new HttpError(400, "Local y visitante deben ser distintos");
    }

    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Partido no encontrado");
    if (existing.status === MatchStatus.FT) {
      throw new HttpError(400, "No se puede editar un partido finalizado");
    }

    const match = await prisma.match.update({
      where: { id },
      data: {
        roundId: body.roundId,
        homeTeamId: body.homeTeamId,
        awayTeamId: body.awayTeamId,
        kickoffUtc: body.kickoffUtc,
        stadium: body.stadium === undefined ? undefined : body.stadium,
      },
      include: { round: true, homeTeam: true, awayTeam: true },
    });
    res.json(toMatchPayload(match));
  }),
);

adminRouter.delete(
  "/matches/:id",
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    await prisma.match.delete({ where: { id } });
    res.status(204).send();
  }),
);

const resultBody = z.object({
  homeGoals: z.coerce.number().int().min(0).max(30),
  awayGoals: z.coerce.number().int().min(0).max(30),
});

adminRouter.post(
  "/matches/:id/result",
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const body = resultBody.parse(req.body);

    await prisma.match.update({
      where: { id },
      data: {
        status: MatchStatus.FT,
        homeGoals: body.homeGoals,
        awayGoals: body.awayGoals,
      },
    });

    const summary = await reconcileScoresAndLeaderboard();

    const match = await prisma.match.findUniqueOrThrow({
      where: { id },
      include: { round: true, homeTeam: true, awayTeam: true },
    });

    res.json({
      match: toMatchPayload(match),
      scoring: summary,
    });
  }),
);

adminRouter.post(
  "/lock-predictions",
  asyncHandler(async (_req, res) => {
    const locked = await lockPredictionsForStartedMatches();
    res.json({ predictionsLocked: locked });
  }),
);

adminRouter.post(
  "/recalculate-leaderboard",
  asyncHandler(async (_req, res) => {
    const scoring = await reconcileScoresAndLeaderboard();
    res.json(scoring);
  }),
);

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [users, preds, matches, rounds, teams] = await Promise.all([
      prisma.user.count(),
      prisma.prediction.count(),
      prisma.match.count(),
      prisma.round.count(),
      prisma.team.count(),
    ]);
    res.json({ users, predictions: preds, matches, rounds, teams });
  }),
);