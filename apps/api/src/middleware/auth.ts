import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "./errorHandler.js";

export type JwtPayload = { sub: string; phone: string; role: string };

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; phone: string; role: string };
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new HttpError(401, "Token requerido"));
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.sub,
      phone: decoded.phone,
      role: decoded.role,
    };
    next();
  } catch {
    next(new HttpError(401, "Token inválido"));
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  void (async () => {
    try {
      if (!req.user) throw new HttpError(401, "No autenticado");
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        throw new HttpError(403, "Solo administradores");
      }
      next();
    } catch (err) {
      next(err);
    }
  })();
}
