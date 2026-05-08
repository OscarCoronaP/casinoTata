import { Router } from "express";
import { z } from "zod";
import { loginUser, registerUser } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{8,14}$/, "Teléfono en formato E.164 (+52...)");

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({
        phone: phoneSchema,
        name: z.string().min(2).max(80),
        nickname: z.string().max(32).optional(),
      })
      .parse(req.body);

    const nickname =
      parsed.nickname === undefined || parsed.nickname.trim() === ""
        ? null
        : parsed.nickname.trim();

    const result = await registerUser({
      phone: parsed.phone,
      name: parsed.name,
      nickname,
    });
    res.status(201).json(result);
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        phone: phoneSchema,
      })
      .parse(req.body);

    const result = await loginUser(body);
    res.json(result);
  }),
);
