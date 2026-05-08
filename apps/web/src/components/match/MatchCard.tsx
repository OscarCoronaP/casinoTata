"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Match } from "@/types/match";
import { cn } from "@/lib/utils";

export function MatchCard({
  match,
  footer,
}: {
  match: Match;
  footer?: ReactNode;
}) {
  const kickoff = new Date(match.kickoffUtc);
  const odds =
    match.oddsHome != null &&
    match.oddsDraw != null &&
    match.oddsAway != null ? (
      <div className="mt-3 flex gap-2 text-[11px] text-zinc-500">
        <span className="rounded-full bg-white/5 px-2 py-0.5">
          Loc {match.oddsHome.toFixed(2)}
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5">
          Emp {match.oddsDraw.toFixed(2)}
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5">
          Vis {match.oddsAway.toFixed(2)}
        </span>
      </div>
    ) : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-black p-4 shadow-[0_18px_80px_-40px_rgba(16,185,129,0.55)]",
      )}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-zinc-500">
        <span>{match.roundLabel}</span>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
          {match.status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          {match.homeLogoUrl ? (
            <Image
              src={match.homeLogoUrl}
              alt={match.homeName}
              width={52}
              height={52}
              className="h-14 w-14 object-contain"
              unoptimized
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-xs">
              {match.homeName.slice(0, 3)}
            </div>
          )}
          <p className="text-sm font-semibold text-white">{match.homeName}</p>
          {match.homeStanding != null && (
            <p className="text-[11px] text-zinc-500">#{match.homeStanding}</p>
          )}
          {match.homeForm && (
            <p className="text-[10px] tracking-wide text-zinc-500">
              {match.homeForm}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center px-2 text-center">
          <p className="text-[11px] text-zinc-500">
            {kickoff.toLocaleDateString("es-MX", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </p>
          <p className="text-lg font-semibold text-emerald-300">
            {kickoff.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="mt-2 text-2xl font-black tracking-tight text-white">
            {match.homeGoals ?? "—"}
            <span className="mx-1 text-zinc-600">:</span>
            {match.awayGoals ?? "—"}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          {match.awayLogoUrl ? (
            <Image
              src={match.awayLogoUrl}
              alt={match.awayName}
              width={52}
              height={52}
              className="h-14 w-14 object-contain"
              unoptimized
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-xs">
              {match.awayName.slice(0, 3)}
            </div>
          )}
          <p className="text-sm font-semibold text-white">{match.awayName}</p>
          {match.awayStanding != null && (
            <p className="text-[11px] text-zinc-500">#{match.awayStanding}</p>
          )}
          {match.awayForm && (
            <p className="text-[10px] tracking-wide text-zinc-500">
              {match.awayForm}
            </p>
          )}
        </div>
      </div>

      {(match.stadium || match.venueCity) && (
        <p className="mt-3 text-center text-[11px] text-zinc-500">
          {match.stadium}
          {match.venueCity ? ` · ${match.venueCity}` : ""}
        </p>
      )}

      {odds}
      {footer && <div className="mt-4 border-t border-white/5 pt-3">{footer}</div>}
    </motion.article>
  );
}
