"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import toast from "react-hot-toast";
import { apiFetch, getApiUrl } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { isRoundPredictionsPubliclyVisible } from "@/lib/predictionWindow";
import type { Match } from "@/types/match";

export type JornadaRow = {
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

type UserPredsPayload = {
  round: { id: string; name: string };
  displayName: string;
  rows: Array<{
    matchId: string;
    predHome: number | null;
    predAway: number | null;
    lockedAt: string | null;
    pointsEarned: number | null;
    hasPrediction: boolean;
    match: Match;
  }>;
};

type Props = {
  roundId: string;
  roundName: string;
  firstKickoffUtc: string | null;
  matchCount: number;
  initialRows: JornadaRow[];
};

function rowKeyHandler(e: KeyboardEvent, action: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    action();
  }
}

type ByRoundPollPayload = {
  rows?: JornadaRow[];
  firstKickoffUtc?: string | null;
  matchCount?: number;
};

export function RankingJornadaClient({
  roundId,
  roundName,
  firstKickoffUtc: initialFirstKickoff,
  matchCount: initialMatchCount,
  initialRows,
}: Props) {
  const { token, user, authReady } = useAuth();
  const [rows, setRows] = useState(initialRows);
  const [firstKickoffUtc, setFirstKickoffUtc] = useState(initialFirstKickoff);
  const [matchCount, setMatchCount] = useState(initialMatchCount);
  const [tick, setTick] = useState(0);

  const [modal, setModal] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPayload, setModalPayload] = useState<UserPredsPayload | null>(
    null,
  );
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setRows(initialRows);
    setFirstKickoffUtc(initialFirstKickoff);
    setMatchCount(initialMatchCount);
  }, [roundId, initialRows, initialFirstKickoff, initialMatchCount]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const othersPredsVisible = useMemo(
    () => isRoundPredictionsPubliclyVisible(firstKickoffUtc, new Date()),
    [firstKickoffUtc, tick],
  );

  useEffect(() => {
    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch(
          getApiUrl(
            `/api/v1/leaderboard/by-round?roundId=${encodeURIComponent(roundId)}`,
          ),
          { cache: "no-store" },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as ByRoundPollPayload;
        if (cancelled) return;
        if (Array.isArray(data.rows)) setRows(data.rows);
        if (typeof data.matchCount === "number") setMatchCount(data.matchCount);
        if ("firstKickoffUtc" in data)
          setFirstKickoffUtc(data.firstKickoffUtc ?? null);
      } catch {
        /* ignore */
      }
    }
    void pull();
    const int = window.setInterval(pull, 25_000);
    return () => {
      cancelled = true;
      window.clearInterval(int);
    };
  }, [roundId]);

  const openUser = useCallback(
    async (userId: string, displayName: string) => {
      if (!authReady) return;
      if (!token) {
        toast.error("Inicia sesión para ver los pronósticos de esta jornada.");
        return;
      }
      const isSelf = user?.id === userId;
      if (!isSelf && !othersPredsVisible) {
        toast.error(
          "Los pronósticos de otros jugadores se mostrarán cuando comience el primer partido de la jornada.",
        );
        return;
      }

      setModal({ userId, displayName });
      setModalLoading(true);
      setModalPayload(null);
      setModalError(null);
      try {
        const data = await apiFetch<UserPredsPayload>(
          `/api/v1/predictions/user/${userId}?roundId=${encodeURIComponent(roundId)}`,
          { token },
        );
        setModalPayload(data);
      } catch (e) {
        setModalError(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        setModalLoading(false);
      }
    },
    [authReady, token, user?.id, othersPredsVisible, roundId],
  );

  const closeModal = useCallback(() => {
    setModal(null);
    setModalPayload(null);
    setModalError(null);
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Misma tabla antes y durante la jornada: pronósticos guardados y, cuando
        se califiquen partidos, puntos y posición.
        {!othersPredsVisible && firstKickoffUtc && (
          <span className="block pt-1 text-amber-200/90">
            Los marcadores de otros usuarios serán visibles al iniciar el primer
            partido (horario programado).
          </span>
        )}
        {matchCount > 0 && (
          <span className="mt-1 block tabular-nums text-zinc-400">
            {rows.length} jugador{rows.length === 1 ? "" : "es"} con al menos un
            pronóstico · {matchCount} partido{matchCount === 1 ? "" : "s"} en la
            jornada
          </span>
        )}
      </p>

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
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-xs text-zinc-500"
                >
                  Nadie ha guardado pronósticos en esta jornada todavía.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.userId}
                role="button"
                tabIndex={0}
                onClick={() =>
                  void openUser(row.userId, row.displayName ?? "—")
                }
                onKeyDown={(e) =>
                  rowKeyHandler(e, () =>
                    void openUser(row.userId, row.displayName ?? "—"),
                  )
                }
                className="cursor-pointer border-b border-white/5 hover:bg-white/[0.04] focus:bg-white/[0.04] focus:outline-none"
              >
                <td className="px-4 py-3 text-emerald-300">{row.rank}</td>
                <td className="px-4 py-3 font-medium text-white">
                  {row.displayName}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                  {row.predictionsCount}
                  {matchCount > 0 ? ` / ${matchCount}` : ""}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.points}
                </td>
                <td className="hidden px-4 py-3 text-right md:table-cell tabular-nums">
                  {row.exactMatches}
                </td>
                <td className="hidden px-4 py-3 text-right md:table-cell tabular-nums text-zinc-400">
                  {row.predictionsResolved}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="presentation"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pred-modal-title"
            className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <h3
                  id="pred-modal-title"
                  className="text-lg font-semibold text-white"
                >
                  {modal.displayName}
                </h3>
                <p className="text-xs text-zinc-500">{roundName}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[calc(85vh-4rem)] overflow-y-auto px-4 py-3">
              {modalLoading && (
                <p className="text-sm text-zinc-400">Cargando…</p>
              )}
              {modalError && (
                <p className="text-sm text-red-300">{modalError}</p>
              )}
              {!modalLoading && modalPayload && (
                <ul className="space-y-3">
                  {modalPayload.rows.map((r) => (
                    <li
                      key={r.matchId}
                      className="rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-sm"
                    >
                      <p className="text-[11px] text-zinc-500">
                        {new Date(r.match.kickoffUtc).toLocaleString("es-MX", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="font-medium text-white">
                        {r.match.homeName}{" "}
                        <span className="text-zinc-500">vs</span>{" "}
                        {r.match.awayName}
                      </p>
                      {r.match.homeGoals != null && r.match.awayGoals != null && (
                        <p className="text-xs text-zinc-400">
                          Resultado: {r.match.homeGoals}–{r.match.awayGoals}
                        </p>
                      )}
                      <p className="mt-1 text-emerald-300">
                        {r.hasPrediction &&
                        r.predHome != null &&
                        r.predAway != null ? (
                          <>
                            Pronóstico:{" "}
                            <span className="font-semibold tabular-nums">
                              {r.predHome}–{r.predAway}
                            </span>
                            {typeof r.pointsEarned === "number" && (
                              <span className="ml-2 text-zinc-500">
                                ({r.pointsEarned} pts)
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-zinc-500">Sin pronóstico</span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
