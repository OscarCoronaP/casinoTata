"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Record<string, number>>("/api/v1/admin/stats", {
        token,
      });
      setStats(data);
    } catch {
      setStats(null);
    }
  }, [token]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  async function run(key: string, path: string, method: "POST" | "GET" = "POST") {
    if (!token) return;
    setBusy(key);
    try {
      const data = await apiFetch<Record<string, unknown>>(path, { method, token });
      toast.success(`${key} OK`);
      if (key === "stats") setStats(data as Record<string, number>);
      else await loadStats();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Resumen</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Gestión manual de jornadas, partidos y marcadores. Sin APIs deportivas externas.
        </p>
      </div>

      {!stats ? (
        <Skeleton className="h-40 w-full max-w-lg" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              ["Equipos", stats.teams],
              ["Jornadas", stats.rounds],
              ["Partidos", stats.matches],
              ["Predicciones", stats.predictions],
              ["Usuarios", stats.users],
            ] as const
          ).map(([label, val]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 px-5 py-4 shadow-inner shadow-black/40"
            >
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
              <p className="mt-2 text-3xl font-black tabular-nums text-emerald-300">{val}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/usuarios"
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black p-6 transition hover:border-emerald-500/30"
        >
          <h2 className="text-lg font-semibold text-white">Usuarios</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Crear cuentas con contraseña inicial desde el servidor (DEFAULT_USER_PASSWORD).
          </p>
          <span className="mt-4 inline-block text-xs font-semibold text-emerald-300">
            Ir →
          </span>
        </Link>
        <Link
          href="/admin/jornadas"
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black p-6 transition hover:border-emerald-500/30"
        >
          <h2 className="text-lg font-semibold text-white">Jornadas</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Crear y activar fechas de jornada (ej. Jornada 15, Cuartos ida).
          </p>
          <span className="mt-4 inline-block text-xs font-semibold text-emerald-300">
            Ir →
          </span>
        </Link>
        <Link
          href="/admin/partidos"
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black p-6 transition hover:border-emerald-500/30"
        >
          <h2 className="text-lg font-semibold text-white">Partidos</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Armado visual local vs visita, horario y estadio opcional.
          </p>
          <span className="mt-4 inline-block text-xs font-semibold text-emerald-300">
            Ir →
          </span>
        </Link>
        <Link
          href="/admin/resultados"
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-black p-6 transition hover:border-emerald-500/30 md:col-span-2"
        >
          <h2 className="text-lg font-semibold text-white">Resultados y puntos</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Captura marcador final; se aplican reglas +3 exacto / +1 ganador y se actualiza el ranking.
          </p>
          <span className="mt-4 inline-block text-xs font-semibold text-emerald-300">
            Ir →
          </span>
        </Link>
      </div>

      <div className="glass-panel grid gap-4 p-6 md:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Bloquear pronósticos</h3>
          <p className="text-xs text-zinc-500">
            Marca locked tras kick-off para quien aún no hubiera guardado.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void run("lock", "/api/v1/admin/lock-predictions")}
            className="w-full"
          >
            {busy === "lock" ? "…" : "Ejecutar bloqueo"}
          </Button>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Recalcular leaderboard</h3>
          <p className="text-xs text-zinc-500">
            Reconcilia todos los partidos FT y reconstruye estadísticas de usuarios.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() =>
              void run("recalc", "/api/v1/admin/recalculate-leaderboard")
            }
            className="w-full"
          >
            {busy === "recalc" ? "…" : "Recalcular todo"}
          </Button>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Refrescar métricas</h3>
          <p className="text-xs text-zinc-500">Actualiza conteos del panel.</p>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void run("stats", "/api/v1/admin/stats", "GET")}
            className="w-full"
          >
            {busy === "stats" ? "…" : "Actualizar stats"}
          </Button>
        </div>
      </div>

      {stats && (
        <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-[11px] text-emerald-200/90">
          {JSON.stringify(stats, null, 2)}
        </pre>
      )}
    </div>
  );
}
