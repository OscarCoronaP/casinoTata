import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import type { Match } from "@/types/match";
import { MatchCard } from "@/components/match/MatchCard";
import { AnimatedHero } from "@/components/home/AnimatedHero";
import { StatCard } from "@/components/home/StatCard";

type LeaderRow = {
  rank: number;
  displayName: string | null;
  totalPoints: number;
  currentStreak: number;
};

async function loadHomeData(): Promise<{
  upcoming: Match[];
  leaderboard: LeaderRow[];
}> {
  try {
    const res = await fetch(getApiUrl("/api/v1/matches?upcoming=true"), {
      cache: "no-store",
    });
    const matchesJson = (await res.json()) as {
      matches: Match[];
      rounds: unknown[];
    };

    const lbRes = await fetch(getApiUrl("/api/v1/leaderboard/global"), {
      cache: "no-store",
    });
    const leaderboard = lbRes.ok
      ? ((await lbRes.json()) as LeaderRow[])
      : [];

    const upcoming = matchesJson.matches
      .filter((m) => m.status === "NS")
      .slice(0, 4);

    return {
      upcoming,
      leaderboard: leaderboard.slice(0, 5),
    };
  } catch {
    return { upcoming: [], leaderboard: [] };
  }
}

export default async function Home() {
  const { upcoming, leaderboard } = await loadHomeData();

  return (
    <div className="space-y-12">
      <AnimatedHero />

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Marcador exacto"
          value="+3"
          hint="Máxima recompensa"
        />
        <StatCard
          title="Ganador / empate"
          value="+1"
          hint="Si fallas el score pero aciertas el desenlace"
        />
        <StatCard
          title="Bloqueo automático"
          value="−2 min"
          hint="Sin trampas: no se guarda en vivo ni después"
        />
      </section>

      <section className="grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Próximos duelos</h2>
            <Link
              href="/predictions"
              className="text-xs text-emerald-300 hover:text-emerald-200"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.length === 0 ? (
              <div className="glass-panel col-span-full rounded-2xl border border-white/10 p-8 text-center text-sm text-zinc-500 md:col-span-2">
                Cuando el administrador publique partidos en una jornada activa,
                aparecerán aquí para pronosticar.
              </div>
            ) : (
              upcoming.map((m) => <MatchCard key={m.id} match={m} />)
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Top jugadores</h2>
          <div className="glass-panel divide-y divide-white/5">
            {leaderboard.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-500">
                Aún no hay puntos en el ranking.
              </div>
            )}
            {leaderboard.map((row) => (
              <div
                key={row.rank}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-emerald-300">
                    {row.rank}
                  </span>
                  <div>
                    <p className="font-medium text-white">{row.displayName}</p>
                    <p className="text-[11px] text-zinc-500">
                      Racha {row.currentStreak}
                    </p>
                  </div>
                </div>
                <span className="text-emerald-300">{row.totalPoints} pts</span>
              </div>
            ))}
          </div>
          <Link
            href="/ranking"
            className="block rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center text-xs font-semibold text-zinc-200 hover:bg-white/5"
          >
            Ranking completo
          </Link>
        </aside>
      </section>
    </div>
  );
}
