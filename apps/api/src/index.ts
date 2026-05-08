import cors from "cors";
import express from "express";
import helmet from "helmet";
import cron from "node-cron";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { matchesRouter } from "./routes/matches.routes.js";
import { predictionsRouter } from "./routes/predictions.routes.js";
import { leaderboardRouter } from "./routes/leaderboard.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { liveRouter } from "./routes/live.routes.js";
import { standingsRouter } from "./routes/standings.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { syncMatchesAndStandings } from "./services/sync.service.js";
import {
  lockPredictionsForStartedMatches,
  scoreFinishedMatches,
} from "./services/scoring.service.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/matches", matchesRouter);
app.use("/api/v1/predictions", predictionsRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/live", liveRouter);
app.use("/api/v1/standings", standingsRouter);
app.use("/api/v1/admin", adminRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.info(`API Liga MX Quiniela en http://localhost:${env.PORT}`);
});

const enableCron =
  process.env.ENABLE_CRON === "true" || process.env.ENABLE_CRON === "1";

if (enableCron) {
  cron.schedule("*/10 * * * *", async () => {
    try {
      if (!env.API_FOOTBALL_KEY) return;
      await syncMatchesAndStandings();
      console.info("[cron] sync football OK");
    } catch (e) {
      console.error("[cron] sync football", e);
    }
  });

  cron.schedule("*/2 * * * *", async () => {
    try {
      await lockPredictionsForStartedMatches();
      await scoreFinishedMatches();
      console.info("[cron] lock + score OK");
    } catch (e) {
      console.error("[cron] scoring", e);
    }
  });

  console.info("Cron habilitado: sync cada 10 min, puntajes cada 2 min");
}
