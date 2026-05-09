"use client";

import type { Team } from "@/types/team";
import { TeamCrest } from "@/components/team/TeamCrest";

export function MatchPreview({
  roundName,
  kickoffLocal,
  stadium,
  home,
  away,
}: {
  roundName: string;
  kickoffLocal: string;
  stadium: string;
  home: Team | null;
  away: Team | null;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-6 shadow-[0_24px_80px_-40px_rgba(16,185,129,0.45)]">
      <p className="text-center text-[11px] uppercase tracking-[0.25em] text-emerald-300/80">
        Vista previa · {roundName || "Jornada"}
      </p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col items-center gap-3 text-center">
          {home ? (
            <>
              <TeamCrest
                name={home.name}
                logoUrl={home.logoUrl}
                primaryColor={home.primaryColor}
                secondaryColor={home.secondaryColor}
                size="xl"
              />
              <p className="text-sm font-bold text-white">{home.shortName}</p>
            </>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-zinc-500">
              Local
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 px-2 text-center">
          <p className="text-3xl font-black text-white">VS</p>
          <p className="text-xs text-emerald-200/90">{kickoffLocal}</p>
          {stadium ? (
            <p className="max-w-[140px] text-[10px] text-zinc-500">{stadium}</p>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col items-center gap-3 text-center">
          {away ? (
            <>
              <TeamCrest
                name={away.name}
                logoUrl={away.logoUrl}
                primaryColor={away.primaryColor}
                secondaryColor={away.secondaryColor}
                size="xl"
              />
              <p className="text-sm font-bold text-white">{away.shortName}</p>
            </>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-white/15 text-xs text-zinc-500">
              Visita
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
