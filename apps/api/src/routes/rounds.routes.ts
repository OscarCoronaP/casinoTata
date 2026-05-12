import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const roundsRouter = Router();

/** Listado público de jornadas activas (filtros en Predicciones / Ranking). */
roundsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rounds = await prisma.round.findMany({
      where: { isActive: true },
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
