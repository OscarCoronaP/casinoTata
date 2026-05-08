import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { promoteBootstrapAdminIfNeeded } from "../services/auth.service.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    await promoteBootstrapAdminIfNeeded(req.user!.id);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { stats: true },
    });
    if (!user) throw new HttpError(404, "Usuario no encontrado");

    const pts = user.stats?.totalPoints ?? 0;
    const strictlyHigher = await prisma.userStats.count({
      where: { totalPoints: { gt: pts } },
    });
    const globalRank = strictlyHigher + 1;

    res.json({
      ...user,
      globalRank,
    });
  }),
);
