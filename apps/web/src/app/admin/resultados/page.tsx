"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Match } from "@/types/match";
import { TeamCrest } from "@/components/team/TeamCrest";
import { Skeleton } from "@/components/ui/Skeleton";

type MatchesPayload = {
  rounds: { id: string; name: string; isActive: boolean }[];
  matches: Match[];
};

export default function AdminResultadosPage() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { h: number; a: number }>>({});

  const reload = useCallback(async () => {
    try {
      const data = await apiFetch<MatchesPayload>("/api/v1/matches");
      const sorted = [...data.matches].sort(
        (a, b) =>
          new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime(),
      );
      setMatches(sorted);
    } catch {
      toast.error("No se pudieron cargar los partidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  function setScore(id: string, field: "h" | "a", val: number) {
    setScores((s) => ({
      ...s,
      [id]: {
        h: field === "h" ? val : (s[id]?.h ?? 0),
        a: field === "a" ? val : (s[id]?.a ?? 0),
      },
    }));
  }

  async function submitResult(m: Match) {
    if (!token) return;
    const sc = scores[m.id] ?? { h: 0, a: 0 };
    setRowBusy(m.id);
    try {
      const res = await apiFetch<{ scoring: { predictionsUpdated: number } }>(
        `/api/v1/admin/matches/${m.id}/result`,
        {
          method: "POST",
          token,
          body: JSON.stringify({ homeGoals: sc.h, awayGoals: sc.a }),
        },
      );
      toast.success(
        `Marcador guardado · Predicciones actualizadas: ${res.scoring.predictionsUpdated}`,
      );
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setRowBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="mt-6 h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Resultados</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Marca FT con marcador final: +3 exacto, +1 ganador/empate. El ranking se recalcula al guardar.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/50">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-black/50 text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Encuentro</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Marcador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {matches.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-zinc-500">
                  No hay partidos. Créalos en la sección Partidos.
                </td>
              </tr>
            ) : (
              matches.map((m) => {
                const sc = scores[m.id] ?? {
                  h: m.homeGoals ?? 0,
                  a: m.awayGoals ?? 0,
                };
                const done = m.status === "FT";
                return (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-4">
                      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                        {m.roundLabel}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <TeamCrest
                            name={m.homeName}
                            logoUrl={m.homeLogoUrl}
                            primaryColor={m.homePrimaryColor}
                            secondaryColor={m.homeSecondaryColor}
                            size="sm"
                          />
                          <span className="font-medium text-white">{m.homeName}</span>
                        </div>
                        <span className="text-zinc-600">vs</span>
                        <div className="flex items-center gap-2">
                          <TeamCrest
                            name={m.awayName}
                            logoUrl={m.awayLogoUrl}
                            primaryColor={m.awayPrimaryColor}
                            secondaryColor={m.awaySecondaryColor}
                            size="sm"
                          />
                          <span className="font-medium text-white">{m.awayName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-zinc-400">
                      {new Date(m.kickoffUtc).toLocaleString("es-MX")}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-emerald-200">
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {done ? (
                          <span className="font-mono text-lg font-bold text-white">
                            {m.homeGoals} — {m.awayGoals}
                          </span>
                        ) : (
                          <>
                            <input
                              type="number"
                              min={0}
                              max={30}
                              className="w-14 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-center text-sm"
                              value={sc.h}
                              onChange={(e) =>
                                setScore(m.id, "h", Number(e.target.value) || 0)
                              }
                            />
                            <span className="text-zinc-600">:</span>
                            <input
                              type="number"
                              min={0}
                              max={30}
                              className="w-14 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-center text-sm"
                              value={sc.a}
                              onChange={(e) =>
                                setScore(m.id, "a", Number(e.target.value) || 0)
                              }
                            />
                            <Button
                              type="button"
                              disabled={rowBusy === m.id}
                              onClick={() => void submitResult(m)}
                              className="px-3 py-1.5 text-xs"
                            >
                              {rowBusy === m.id ? "…" : "Guardar FT"}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
