import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { normalizeLogoUrl } from "../utils/logoUrl.js";

export const teamsRouter = Router();

teamsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
    });
    res.json(
      teams.map((t) => ({
        ...t,
        logoUrl: normalizeLogoUrl(t.logoUrl),
      })),
    );
  }),
);
