import { getApiUrl } from "@/lib/api";

type GlobalRow = {
  rank: number;
  displayName: string | null;
  totalPoints: number;
  exactMatches: number;
  winnerHits: number;
  currentStreak: number;
  bestStreak: number;
};

type WeeklyRow = {
  rank: number;
  displayName?: string | null;
  weeklyPoints: number;
};

async function load(): Promise<{ global: GlobalRow[]; weekly: WeeklyRow[] }> {
  try {
    const [gRes, wRes] = await Promise.all([
      fetch(getApiUrl("/api/v1/leaderboard/global"), { cache: "no-store" }),
      fetch(getApiUrl("/api/v1/leaderboard/weekly"), { cache: "no-store" }),
    ]);
    const global = gRes.ok ? ((await gRes.json()) as GlobalRow[]) : [];
    const weekly = wRes.ok ? ((await wRes.json()) as WeeklyRow[]) : [];
    return { global, weekly };
  } catch {
    return { global: [], weekly: [] };
  }
}

export default async function RankingPage() {
  const { global, weekly } = await load();

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Ranking global</h1>
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Top semanal</h2>
        <p className="text-sm text-zinc-500">
          Suma de puntos de los últimos 7 días por predicciones ya calificadas.
        </p>
        <div className="glass-panel divide-y divide-white/5">
          {weekly.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-zinc-500">
              Sin actividad reciente.
            </p>
          )}
          {weekly.map((row) => (
            <div
              key={row.rank}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-300">
                  {row.rank}
                </span>
                <span className="font-medium text-white">{row.displayName}</span>
              </div>
              <span className="text-emerald-300">{row.weeklyPoints} pts</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
