import dotenv from "dotenv";
import { z } from "zod";

// En Windows suele existir DATABASE_URL global; prioriza apps/api/.env en local.
dotenv.config({ override: true });

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  API_FOOTBALL_KEY: z.string().optional().default(""),
  API_FOOTBALL_BASE_URL: z
    .string()
    .url()
    .default("https://v3.football.api-sports.io"),
  API_FOOTBALL_LEAGUE_ID: z.coerce.number().default(262),
  API_FOOTBALL_SEASON: z.coerce.number().default(2025),
  ADMIN_BOOTSTRAP_PHONE: z
    .string()
    .optional()
    .default("")
    .transform((s) => (typeof s === "string" ? s.trim() : "")),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
});

export const env = schema.parse(process.env);
