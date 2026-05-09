import dotenv from "dotenv";
import { z } from "zod";

// En Windows suele existir DATABASE_URL global; prioriza apps/api/.env en local.
dotenv.config({ override: true });

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  ADMIN_BOOTSTRAP_PHONE: z
    .string()
    .optional()
    .default("")
    .transform((s) => (typeof s === "string" ? s.trim() : "")),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  /** Contraseña inicial para usuarios creados por admin. Si está vacía, no se puede usar `POST /admin/users`. Mín. 8 al configurarla. */
  DEFAULT_USER_PASSWORD: z
    .string()
    .optional()
    .default("")
    .transform((s) => (typeof s === "string" ? s.trim() : "")),
})
  .superRefine((data, ctx) => {
    const p = data.DEFAULT_USER_PASSWORD;
    if (p !== "" && p.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "DEFAULT_USER_PASSWORD debe tener al menos 8 caracteres o dejarse sin definir",
        path: ["DEFAULT_USER_PASSWORD"],
      });
    }
  });

export const env = schema.parse(process.env);
