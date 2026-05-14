/** No se aceptan cambios de predicción cuando falten estos ms (o menos) para el kick-off. */
export const PREDICTION_CLOSE_BEFORE_MS = 2 * 60 * 1000;

/**
 * Una jornada queda cerrada para predicciones cuando el partido más temprano
 * de la ronda está a `PREDICTION_CLOSE_BEFORE_MS` (o menos) de comenzar.
 * A partir de ese instante no se permite guardar predicciones de NINGÚN
 * partido de la jornada (incluyendo los partidos posteriores).
 */
export function isRoundPredictionWindowClosed(
  firstKickoffUtc: Date,
  now: Date = new Date(),
): boolean {
  return firstKickoffUtc.getTime() - PREDICTION_CLOSE_BEFORE_MS <= now.getTime();
}

/**
 * Los pronósticos de otros usuarios en una jornada sólo pueden mostrarse
 * una vez iniciado el horario del primer partido (kick-off), no antes.
 * (La edición propia se cierra 2 min antes; la visibilidad pública es al kick-off.)
 */
export function isRoundPredictionsPubliclyVisible(
  firstKickoffUtc: Date,
  now: Date = new Date(),
): boolean {
  return firstKickoffUtc.getTime() <= now.getTime();
}
