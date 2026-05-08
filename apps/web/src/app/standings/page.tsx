import { getApiUrl } from "@/lib/api";

type Row = {
  rank: number;
  teamName: string;
  logoUrl: string | null;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsDiff: number;
  form: string | null;
};

async function load(): Promise<Row[]> {
  try {
    const res = await fetch(getApiUrl("/api/v1/standings"), { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Row[];
  } catch {
    return [];
  }
}

export default async function StandingsPage() {
  const rows = await load();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tabla general</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Posiciones sincronizadas desde API-Football para la temporada actual.
        </p>
      </div>

      <div className="glass-panel overflow-x-auto">
        <table className="min-w-full text-left text-xs md:text-sm">
          <thead className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Club</th>
              <th className="px-3 py-3 text-center">PJ</th>
              <th className="px-3 py-3 text-center">G</th>
              <th className="px-3 py-3 text-center">E</th>
              <th className="px-3 py-3 text-center">P</th>
              <th className="px-3 py-3 text-center">DG</th>
              <th className="px-3 py-3 text-center">Pts</th>
              <th className="hidden px-3 py-3 md:table-cell">Forma</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-xs text-zinc-500"
                >
                  Ejecuta sincronización admin cuando configures la API deportiva.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.rank}
                className="border-b border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-3 py-3 text-emerald-300">{r.rank}</td>
                <td className="px-3 py-3 font-medium text-white">{r.teamName}</td>
                <td className="px-3 py-3 text-center tabular-nums">{r.played}</td>
                <td className="px-3 py-3 text-center tabular-nums">{r.win}</td>
                <td className="px-3 py-3 text-center tabular-nums">{r.draw}</td>
                <td className="px-3 py-3 text-center tabular-nums">{r.lose}</td>
                <td className="px-3 py-3 text-center tabular-nums">
                  {r.goalsDiff}
                </td>
                <td className="px-3 py-3 text-center font-semibold text-emerald-300">
                  {r.points}
                </td>
                <td className="hidden px-3 py-3 font-mono text-[11px] text-zinc-400 md:table-cell">
                  {r.form ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
