import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { matchesRouter } from "./routes/matches.routes.js";
import { predictionsRouter } from "./routes/predictions.routes.js";
import { leaderboardRouter } from "./routes/leaderboard.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { liveRouter } from "./routes/live.routes.js";
import { teamsRouter } from "./routes/teams.routes.js";
import { roundsRouter } from "./routes/rounds.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

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
app.use("/api/v1/teams", teamsRouter);
app.use("/api/v1/rounds", roundsRouter);
app.use("/api/v1/admin", adminRouter);

app.use(errorHandler);

const host = process.env.HOST ?? "0.0.0.0";
app.listen(env.PORT, host, () => {
  console.info(`API Liga MX Quiniela en http://${host}:${env.PORT}`);
});
