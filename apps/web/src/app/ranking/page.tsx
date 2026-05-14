import { getApiUrl } from "@/lib/api";
import { RankingJornadaClient } from "./RankingJornadaClient";
import { RoundSelector } from "./RoundSelector";

type GlobalRow = {
  rank: number;
  displayName: string | null;
  totalPoints: number;
  exactMatches: number;
  winnerHits: number;
  currentStreak: number;
  bestStreak: number;
};

type RoundInfo = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type JornadaRow = {
  rank: number;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  predictionsCount: number;
  points: number;
  exactMatches: number;
  winnerHits: number;
  predictionsResolved: number;
};

type ByRoundResponse = {
  round: RoundInfo | null;
  firstKickoffUtc?: string | null;
  matchCount?: number;
  rows: JornadaRow[];
};

type RoundListItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sortOrder: number;
  matchCount: number;
};

async function load(roundId?: string): Promise<{
  global: GlobalRow[];
  byRound: ByRoundResponse;
  rounds: RoundListItem[];
}> {
  try {
    const byRoundUrl = roundId
      ? `/api/v1/leaderboard/by-round?roundId=${encodeURIComponent(roundId)}`
      : "/api/v1/leaderboard/by-round";

    const [gRes, bRes, rRes] = await Promise.all([
      fetch(getApiUrl("/api/v1/leaderboard/global"), { cache: "no-store" }),
      fetch(getApiUrl(byRoundUrl), { cache: "no-store" }),
      fetch(getApiUrl("/api/v1/rounds"), { cache: "no-store" }),
    ]);

    const global = gRes.ok ? ((await gRes.json()) as GlobalRow[]) : [];
    const byRound = bRes.ok
      ? ((await bRes.json()) as ByRoundResponse)
      : { round: null, rows: [] };
    const rounds = rRes.ok ? ((await rRes.json()) as RoundListItem[]) : [];

    return { global, byRound, rounds };
  } catch {
    return { global: [], byRound: { round: null, rows: [] }, rounds: [] };
  }
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: { roundId?: string };
}) {
  const { global, byRound, rounds } = await load(searchParams.roundId);
  const selectedRoundId = byRound.round?.id ?? "";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Ranking por jornada
            </h1>
            <p className="text-sm text-zinc-500">
              {byRound.round
                ? `Jornada ${byRound.round.name}: participación y puntos en la misma tabla.`
                : "Selecciona una jornada para ver el ranking."}
            </p>
          </div>
          <RoundSelector
            rounds={rounds.map((r) => ({
              id: r.id,
              name: r.name,
              isActive: r.isActive,
            }))}
            selectedId={selectedRoundId}
          />
        </div>

        {byRound.round ? (
          <RankingJornadaClient
            roundId={byRound.round.id}
            roundName={byRound.round.name}
            firstKickoffUtc={byRound.firstKickoffUtc ?? null}
            matchCount={byRound.matchCount ?? 0}
            initialRows={byRound.rows}
          />
        ) : (
          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Jugador</th>
                  <th className="px-4 py-3 text-right">Pronósticos</th>
                  <th className="px-4 py-3 text-right">Pts</th>
                  <th className="hidden px-4 py-3 text-right md:table-cell">
                    Exactos
                  </th>
                  <th className="hidden px-4 py-3 text-right md:table-cell">
                    Resueltas
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-xs text-zinc-500"
                  >
                    Sin jornada activa para mostrar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Ranking global</h2>
        <p className="text-sm text-zinc-500">
          Acumulado total desde el inicio del torneo.
        </p>
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Jugador</th>
                <th className="px-4 py-3 text-right">Pts</th>
                <th className="hidden px-4 py-3 text-right md:table-cell">
                  Exactos
                </th>
                <th className="hidden px-4 py-3 text-right md:table-cell">
                  Racha
                </th>
              </tr>
            </thead>
            <tbody>
              {global.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-xs text-zinc-500"
                  >
                    Aún no hay puntajes registrados.
                  </td>
                </tr>
              )}
              {global.map((row) => (
                <tr
                  key={row.rank}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-emerald-300">{row.rank}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {row.displayName}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.totalPoints}
                  </td>
                  <td className="hidden px-4 py-3 text-right md:table-cell">
                    {row.exactMatches}
                  </td>
                  <td className="hidden px-4 py-3 text-right md:table-cell">
                    {row.currentStreak}/{row.bestStreak}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
