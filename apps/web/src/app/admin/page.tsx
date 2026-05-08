"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminPage() {
  const { authReady, token, user, refreshProfile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!authReady || !token) return;
    void refreshProfile();
  }, [authReady, token, refreshProfile]);

  async function run(
    key: string,
    path: string,
    method: "POST" | "GET" = "POST",
  ) {
    if (!token) return;
    setBusy(key);
    try {
      const data = await apiFetch<Record<string, unknown>>(path, {
        method,
        token,
      });
      toast.success(`${key} OK`);
      if (key === "stats") setStats(data as Record<string, number>);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  if (!authReady) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!token || user?.role !== "ADMIN") {
    return (
      <div className="glass-panel mx-auto max-w-lg space-y-4 p-8 text-center text-sm text-zinc-400">
        <p>Sólo administradores pueden ver esta página.</p>
        <p className="text-xs">
          Asegúrate de que en{" "}
          <code className="rounded bg-black/40 px-2 py-1 text-emerald-300">
            ADMIN_BOOTSTRAP_PHONE
          </code>{" "}
          del backend coincida exactamente tu teléfono (mismo formato E.164),
          reinicia la API y vuelve a entrar aquí.
        </p>
        <Link href="/" className="text-emerald-300 hover:text-emerald-200">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard admin</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Operaciones sensibles: sincroniza datos externos y recalcula puntajes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminCard
          title="Sincronizar Liga MX"
          description="Descarga fixtures + tabla desde API-Football."
          action={() => void run("sync", "/api/v1/admin/sync-football")}
          loading={busy === "sync"}
        />
        <AdminCard
          title="Bloquear predicciones"
          description="Marca como bloqueadas tras kick-off."
          action={() => void run("lock", "/api/v1/admin/lock-predictions")}
          loading={busy === "lock"}
        />
        <AdminCard
          title="Calificar partidos"
          description="Aplica reglas 3/1 punto a encuentros FT."
          action={() => void run("score", "/api/v1/admin/score-matches")}
          loading={busy === "score"}
        />
        <AdminCard
          title="Estadísticas rápidas"
          description="Usuarios, predicciones y partidos en BD."
          action={() => void run("stats", "/api/v1/admin/stats", "GET")}
          loading={busy === "stats"}
        />
      </div>

      {stats && (
        <pre className="glass-panel overflow-x-auto p-4 text-xs text-emerald-200">
          {JSON.stringify(stats, null, 2)}
        </pre>
      )}
    </div>
  );
}

function AdminCard({
  title,
  description,
  action,
  loading,
}: {
  title: string;
  description: string;
  action: () => void;
  loading: boolean;
}) {
  return (
    <div className="glass-panel flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={action}
        className="mt-auto w-full"
      >
        {loading ? "Ejecutando..." : "Ejecutar"}
      </Button>
    </div>
  );
}
