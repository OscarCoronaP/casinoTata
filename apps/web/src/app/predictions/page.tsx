"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MatchCard } from "@/components/match/MatchCard";
import { ScorePicker } from "@/components/match/ScorePicker";
import type { Match } from "@/types/match";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/Skeleton";

type MatchesPayload = { rounds: string[]; matches: Match[] };

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
  const [round, setRound] = useState<string | null>(null);
  const [payload, setPayload] = useState<MatchesPayload | null>(null);
  const [preds, setPreds] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<MatchesPayload>("/api/v1/matches");
        if (cancelled) return;
        setPayload(data);
        setRound((r) => r ?? data.rounds[data.rounds.length - 1] ?? null);
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
    if (!payload || !round) return [];
    return payload.matches.filter((m) => m.roundLabel === round);
  }, [payload, round]);

  function predFor(matchId: string) {
    return preds.find((p) => p.matchId === matchId);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Predicciones</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Elige marcador por partido. Se bloquea al iniciar el encuentro.
          </p>
        </div>
        {payload && (
          <select
            className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm outline-none"
            value={round ?? ""}
            onChange={(e) => setRound(e.target.value)}
          >
            {payload.rounds.map((r) => (
              <option key={r} value={r}>
                {r}
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
          No hay partidos en esta jornada todavía. Sincroniza desde el panel admin cuando tengas API key.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((m) => {
          const p = predFor(m.id);
          const kickoff = new Date(m.kickoffUtc);
          const locked =
            m.status !== "NS" || kickoff.getTime() <= Date.now() || !!p?.lockedAt;

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
