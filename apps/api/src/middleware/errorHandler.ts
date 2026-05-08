import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      details: err.flatten(),
    });
  }
  const message = err instanceof Error ? err.message : "Error interno";
  const status =
    err instanceof HttpError ? err.statusCode : 500;
  return res.status(status).json({
    error: message,
  });
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
