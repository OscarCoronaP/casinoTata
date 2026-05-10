/**
 * Debe coincidir con `apps/api/src/config/predictionWindow.ts`.
 */
export const PREDICTION_CLOSE_BEFORE_MS = 2 * 60 * 1000;

/**
 * Una jornada queda cerrada para predicciones cuando el partido más temprano
 * está a `PREDICTION_CLOSE_BEFORE_MS` (o menos) de comenzar.
 * A partir de ese instante todos los partidos de la jornada quedan bloqueados.
 */
export function isRoundPredictionWindowClosed(
  matches: Array<{ kickoffUtc: string | Date }>,
  now: Date = new Date(),
): boolean {
  if (matches.length === 0) return false;
  let earliest = Infinity;
  for (const m of matches) {
    const k =
      typeof m.kickoffUtc === "string"
        ? new Date(m.kickoffUtc).getTime()
        : m.kickoffUtc.getTime();
    if (k < earliest) earliest = k;
  }
  return earliest - PREDICTION_CLOSE_BEFORE_MS <= now.getTime();
}

/**
 * Una predicción individual está bloqueada si:
 * - ya fue bloqueada por el job (`lockedAt`), o
 * - la ventana de la jornada (`roundLocked`) ya cerró.
 */
export function isPredictionLocked(opts: {
  lockedAt?: string | null;
  roundLocked: boolean;
}): boolean {
  if (opts.lockedAt) return true;
  return opts.roundLocked;
}
