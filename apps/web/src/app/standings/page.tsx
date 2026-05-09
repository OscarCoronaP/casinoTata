import { getApiUrl } from "@/lib/api";
import type { Team } from "@/types/team";
import { TeamCrest } from "@/components/team/TeamCrest";

async function loadTeams(): Promise<Team[]> {
  try {
    const res = await fetch(getApiUrl("/api/v1/teams"), { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Team[];
  } catch {
    return [];
  }
}

export default async function StandingsPage() {
  const teams = await loadTeams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Equipos Liga MX</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Plantilla oficial de la quiniela. Los administradores eligen estos clubes al crear partidos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-500">
            Ejecuta el seed de equipos en la API (`npm run db:seed`).
          </p>
        ) : (
          teams.map((t) => (
            <div
              key={t.id}
              className="glass-panel flex items-center gap-4 rounded-2xl border border-white/10 p-4"
            >
              <TeamCrest
                name={t.name}
                logoUrl={t.logoUrl}
                primaryColor={t.primaryColor}
                secondaryColor={t.secondaryColor}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.shortName}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
