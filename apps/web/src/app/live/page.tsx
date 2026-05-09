"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/match/MatchCard";
import type { Match } from "@/types/match";
import { getApiUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(getApiUrl("/api/v1/live/matches"), {
          cache: "no-store",
        });
        const data = res.ok ? ((await res.json()) as Match[]) : [];
        if (!cancelled) setMatches(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void poll();
    const id = setInterval(poll, 25_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Partidos en vivo</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Solo aparecen encuentros marcados como LIVE / HT por el administrador.
          Refresco cada 25s.
        </p>
      </div>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      )}

      {!loading && matches.length === 0 && (
        <p className="text-sm text-zinc-500">
          No hay partidos en vivo en este momento.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}
