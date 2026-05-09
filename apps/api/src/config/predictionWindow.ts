import { MatchStatus } from "@prisma/client";

/** No se aceptan cambios de predicción cuando falten estos ms (o menos) para el kick-off. */
export const PREDICTION_CLOSE_BEFORE_MS = 2 * 60 * 1000;

export function isPredictionWindowClosed(
  status: MatchStatus,
  kickoffUtc: Date,
  now: Date = new Date(),
): boolean {
  if (status !== MatchStatus.NS) return true;
  return kickoffUtc.getTime() - PREDICTION_CLOSE_BEFORE_MS <= now.getTime();
}
