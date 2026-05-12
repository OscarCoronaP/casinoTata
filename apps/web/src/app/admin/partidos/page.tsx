"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { Team } from "@/types/team";
import { TeamPicker } from "@/components/admin/TeamPicker";
import { MatchPreview } from "@/components/admin/MatchPreview";
import { Skeleton } from "@/components/ui/Skeleton";

type RoundOpt = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sortOrder: number;
  matchCount: number;
};

export default function AdminPartidosPage() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds, setRounds] = useState<RoundOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [roundId, setRoundId] = useState<string>("");
  const [homeTeamId, setHomeTeamId] = useState<string | null>(null);
  const [awayTeamId, setAwayTeamId] = useState<string | null>(null);
  const [kickoff, setKickoff] = useState("");
  const [stadium, setStadium] = useState("");

  const reload = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [t, r] = await Promise.all([
        apiFetch<Team[]>("/api/v1/teams"),
        apiFetch<RoundOpt[]>("/api/v1/admin/rounds", { token }),
      ]);
      setTeams(t);
      setRounds(r);
      setRoundId((id) => id || r.find((x) => x.isActive)?.id || r[0]?.id || "");
    } catch {
      toast.error("Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const round = rounds.find((x) => x.id === roundId);
  const home = teams.find((t) => t.id === homeTeamId) ?? null;
  const away = teams.find((t) => t.id === awayTeamId) ?? null;

  const previewKickoff = useMemo(() => {
    if (!kickoff) return "Horario por definir";
    return new Date(kickoff).toLocaleString("es-MX", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [kickoff]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!roundId || !homeTeamId || !awayTeamId || !kickoff) {
      toast.error("Selecciona jornada, equipos y fecha");
      return;
    }
    if (homeTeamId === awayTeamId) {
      toast.error("Local y visitante deben ser distintos");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/v1/admin/matches", {
        method: "POST",
        token,
        body: JSON.stringify({
          roundId,
          homeTeamId,
          awayTeamId,
          kickoffUtc: new Date(kickoff).toISOString(),
          stadium: stadium.trim() || null,
        }),
      });
      toast.success("Partido creado");
      setAwayTeamId(null);
      setKickoff("");
      setStadium("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[480px] w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Crear partido</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Elige clubes con buscador visual y confirma horario. Los usuarios podrán pronosticar hasta el kick-off.
        </p>
      </div>

      <form onSubmit={(e) => void submit(e)} className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Jornada
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500/40"
              value={roundId}
              onChange={(e) => setRoundId(e.target.value)}
            >
              {rounds.length === 0 ? (
                <option value="">— Crea una jornada primero —</option>
              ) : (
                rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {!r.isActive ? " (inactiva)" : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            <TeamPicker
              label="Equipo local"
              teams={teams}
              value={homeTeamId}
              excludeId={awayTeamId}
              onChange={(id) => setHomeTeamId(id)}
            />
            <TeamPicker
              label="Equipo visitante"
              teams={teams}
              value={awayTeamId}
              excludeId={homeTeamId}
              onChange={(id) => setAwayTeamId(id)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500/40"
                value={kickoff}
                onChange={(e) => setKickoff(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Estadio (opcional)
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500/40"
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
                placeholder="Ej. Estadio BBVA"
              />
            </div>
          </div>

          <Button type="submit" disabled={saving || rounds.length === 0} className="w-full sm:w-auto">
            {saving ? "Guardando…" : "Publicar partido"}
          </Button>
        </div>

        <MatchPreview
          roundName={round?.name ?? ""}
          kickoffLocal={previewKickoff}
          stadium={stadium.trim()}
          home={home}
          away={away}
        />
      </form>
    </div>
  );
}
