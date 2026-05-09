/**
 * Debe coincidir con `apps/api/src/config/predictionWindow.ts`.
 */
export const PREDICTION_CLOSE_BEFORE_MS = 2 * 60 * 1000;

export function isPredictionLocked(match: {
  status: string;
  kickoffUtc: string | Date;
  lockedAt?: string | null;
}): boolean {
  if (match.lockedAt) return true;
  if (match.status !== "NS") return true;
  const kick =
    typeof match.kickoffUtc === "string"
      ? new Date(match.kickoffUtc)
      : match.kickoffUtc;
  return kick.getTime() - PREDICTION_CLOSE_BEFORE_MS <= Date.now();
}
