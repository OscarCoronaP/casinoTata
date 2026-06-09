import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import type { Match } from "@/types/match";
import { MatchCardMundial as MatchCard } from "@/components/match/MatchCardMundial";
import { AnimatedHeroMundial } from "@/components/home/AnimatedHeroMundial";
import { StatCardMundial } from "@/components/home/StatCardMundial";

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
    <div className="space-y-10">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <AnimatedHeroMundial />

      {/* ── Stats de reglas ───────────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCardMundial
          title="Marcador exacto"
          value="+3"
          hint="Máxima recompensa"
          accent="gold"
        />
        <StatCardMundial
          title="Ganador / empate"
          value="+1"
          hint="Si fallas el score pero aciertas el desenlace"
          accent="sky"
        />
        <StatCardMundial
          title="Bloqueo automático"
          value="−2 min"
          hint="Sin trampas: no se guarda en vivo ni después del partido"
          accent="red"
        />
      </section>

      {/* ── Partidos + Leaderboard ────────────────────────────────────────── */}
      <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">

        {/* Partidos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2
              className="text-2xl leading-none"
              style={{
                fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
                letterSpacing: "0.04em",
                color: "#EDF4FF",
              }}
            >
              Próximos duelos
            </h2>
            <Link
              href="/predictions"
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: "var(--wc-sky)" }}
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.length === 0 ? (
              <div
                className="glass-panel col-span-full p-8 text-center text-sm md:col-span-2"
                style={{ color: "var(--muted-2)" }}
              >
                Cuando el administrador publique partidos en una jornada activa,
                aparecerán aquí para pronosticar.
              </div>
            ) : (
              upcoming.map((m) => <MatchCard key={m.id} match={m} />)
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <aside className="space-y-4">
          <h2
            className="text-2xl leading-none"
            style={{
              fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
              letterSpacing: "0.04em",
              color: "#EDF4FF",
            }}
          >
            Top jugadores
          </h2>

          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
          >
            {leaderboard.length === 0 && (
              <div
                className="p-4 text-center text-xs"
                style={{ color: "var(--muted-2)" }}
              >
                Aún no hay puntos en el ranking.
              </div>
            )}
            {leaderboard.map((row, i) => (
              <div
                key={row.rank}
                className="flex items-center justify-between px-4 py-3 text-sm"
                style={{
                  borderBottom:
                    i < leaderboard.length - 1
                      ? "1px solid rgba(79,163,224,0.07)"
                      : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge: top 3 dorado, resto sky */}
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background:
                        row.rank <= 3
                          ? "rgba(245,166,35,0.15)"
                          : "rgba(79,163,224,0.1)",
                      color:
                        row.rank <= 3
                          ? "var(--wc-gold)"
                          : "var(--wc-sky)",
                    }}
                  >
                    {row.rank}
                  </span>
                  <div>
                    <p className="font-medium" style={{ color: "#EDF4FF" }}>
                      {row.displayName}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--muted-2)" }}>
                      Racha {row.currentStreak}
                    </p>
                  </div>
                </div>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: "var(--wc-gold)" }}
                >
                  {row.totalPoints} pts
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/ranking"
            className="block rounded-xl px-4 py-3 text-center text-xs font-semibold transition-colors"
            style={{
              border: "1px solid var(--border)",
              background: "rgba(79,163,224,0.05)",
              color: "#EDF4FF",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(79,163,224,0.1)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(79,163,224,0.05)")
            }
          >
            Ranking completo →
          </Link>
        </aside>
      </section>
    </div>
  );
}
