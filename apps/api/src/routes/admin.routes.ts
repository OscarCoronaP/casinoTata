import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { syncMatchesAndStandings } from "../services/sync.service.js";
import {
  lockPredictionsForStartedMatches,
  scoreFinishedMatches,
} from "../services/scoring.service.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.post(
  "/sync-football",
  asyncHandler(async (_req, res) => {
    const result = await syncMatchesAndStandings();
    res.json(result);
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
  "/score-matches",
  asyncHandler(async (_req, res) => {
    const result = await scoreFinishedMatches();
    res.json(result);
  }),
);

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [users, preds, matches] = await Promise.all([
      prisma.user.count(),
      prisma.prediction.count(),
      prisma.match.count(),
    ]);
    res.json({ users, predictions: preds, matches });
  }),
);
