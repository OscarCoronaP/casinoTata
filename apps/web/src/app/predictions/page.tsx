"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MatchCard } from "@/components/match/MatchCard";
import { ScorePicker } from "@/components/match/ScorePicker";
import type { Match } from "@/types/match";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  isPredictionLocked,
  isRoundPredictionWindowClosed,
} from "@/lib/predictionWindow";

type RoundOpt = { id: string; name: string; isActive: boolean };
type MatchesPayload = { rounds: RoundOpt[]; matches: Match[] };

type PredictionRow = {
  id: string;
  matchId: string;
  predHome: number;
  predAway: number;
  lockedAt: string | null;
  pointsEarned: number | null;
};

export default function PredictionsPage() {
  const { token } = useAuth();
  const [roundId, setRoundId] = useState<string | null>(null);
  const [payload, setPayload] = useState<MatchesPayload | null>(null);
  const [preds, setPreds] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);
  /** Re-evalúa el cierre de la jornada cuando el reloj cruza el umbral (−2 min). */
  const [lockTick, setLockTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setLockTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<MatchesPayload>("/api/v1/matches");
        if (cancelled) return;
        setPayload(data);
        setRoundId((r) => {
          if (r) return r;
          const active = data.rounds.find((x) => x.isActive);
          const fallback =
            active ??
            data.rounds[data.rounds.length - 1] ??
            data.rounds[0] ??
            null;
          return fallback?.id ?? null;
        });
      } catch {
        toast.error("No se pudieron cargar los partidos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setPreds([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await apiFetch<PredictionRow[]>("/api/v1/predictions/me", {
          token,
        });
        if (!cancelled) setPreds(rows);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => {
    if (!payload || !roundId) return [];
    return payload.matches.filter((m) => m.roundId === roundId);
  }, [payload, roundId]);

  /**
   * El bloqueo se evalúa por jornada en función del partido más temprano.
   * `lockTick` fuerza la re-evaluación cada 15 s para que la UI cierre sola
   * al cruzar el umbral de −2 min.
   */
  const roundLocked = useMemo(
    () => isRoundPredictionWindowClosed(filtered),
    [filtered, lockTick],
  );

  function predFor(matchId: string) {
    return preds.find((p) => p.matchId === matchId);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Predicciones</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Elige marcador por partido. La jornada completa se cierra 2 minutos antes del primer partido programado.
          </p>
        </div>
        {payload && payload.rounds.length > 0 && (
          <select
            className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none"
            value={roundId ?? ""}
            onChange={(e) => setRoundId(e.target.value)}
          >
            {payload.rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-zinc-500">
          No hay partidos en esta jornada todavía. Un administrador debe crear la jornada y los encuentros desde el panel admin.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((m) => {
          const p = predFor(m.id);
          const locked = isPredictionLocked({
            lockedAt: p?.lockedAt,
            roundLocked,
          });

          return (
            <MatchCard
              key={m.id}
              match={m}
              footer={
                <div className="space-y-3">
                  {p && (
                    <p className="text-center text-[11px] text-zinc-400">
                      Tu pronóstico:{" "}
                      <span className="font-semibold text-emerald-300">
                        {p.predHome}-{p.predAway}
                      </span>
                      {typeof p.pointsEarned === "number" && (
                        <span className="ml-2 text-zinc-500">
                          ({p.pointsEarned} pts)
                        </span>
                      )}
                    </p>
                  )}
                  <ScorePicker matchId={m.id} disabled={locked} />
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
