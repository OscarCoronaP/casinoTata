"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/Skeleton";

type RoundRow = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sortOrder: number;
  matchCount: number;
};

export default function AdminJornadasPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<RoundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const reload = useCallback(async () => {
    try {
      const data = await apiFetch<RoundRow[]>("/api/v1/rounds");
      setRows(data);
    } catch {
      toast.error("No se pudieron cargar las jornadas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function createRound(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!name.trim() || !start || !end) {
      toast.error("Completa nombre y fechas");
      return;
    }
    setBusy("create");
    try {
      await apiFetch("/api/v1/admin/rounds", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: name.trim(),
          startDate: new Date(start).toISOString(),
          endDate: new Date(end).toISOString(),
          isActive: true,
          sortOrder,
        }),
      });
      toast.success("Jornada creada");
      setName("");
      setStart("");
      setEnd("");
      setSortOrder(0);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function toggleActive(r: RoundRow) {
    if (!token) return;
    setBusy(r.id);
    try {
      await apiFetch(`/api/v1/admin/rounds/${r.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      toast.success("Actualizado");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function removeRound(id: string) {
    if (!token || !window.confirm("¿Eliminar jornada y todos sus partidos?")) return;
    setBusy(id);
    try {
      await apiFetch(`/api/v1/admin/rounds/${id}`, { method: "DELETE", token });
      toast.success("Jornada eliminada");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Jornadas</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Define el nombre comercial de la fecha y el rango; sólo las activas destacan en filtros.
        </p>
      </div>

      <form
        onSubmit={(e) => void createRound(e)}
        className="glass-panel grid gap-4 rounded-2xl border border-white/10 p-6 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <label className="text-xs font-semibold text-zinc-500">Nombre</label>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500/40"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Jornada 15 · Cuartos ida"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500">Inicio</label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500/40"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500">Fin</label>
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500/40"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500">Orden (opcional)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-emerald-500/40"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
        <div className="flex items-end md:col-span-2">
          <Button type="submit" disabled={busy === "create"} className="w-full md:w-auto">
            {busy === "create" ? "Creando…" : "Crear jornada"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950/40">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-black/50 text-[11px] uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Jornada</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin</th>
                <th className="px-4 py-3 text-center">Partidos</th>
                <th className="px-4 py-3 text-center">Activa</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                    Aún no hay jornadas. Crea la primera arriba.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(r.startDate).toLocaleString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(r.endDate).toLocaleString("es-MX")}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-zinc-300">
                      {r.matchCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          r.isActive
                            ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300"
                            : "rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-500"
                        }
                      >
                        {r.isActive ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="flex justify-end gap-2 px-4 py-3">
                      <button
                        type="button"
                        disabled={busy !== null}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                        onClick={() => void toggleActive(r)}
                      >
                        {r.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        onClick={() => void removeRound(r.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
