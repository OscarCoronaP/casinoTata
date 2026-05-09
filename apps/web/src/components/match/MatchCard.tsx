"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Match } from "@/types/match";
import { cn } from "@/lib/utils";
import { TeamCrest } from "@/components/team/TeamCrest";

export function MatchCard({
  match,
  footer,
}: {
  match: Match;
  footer?: ReactNode;
}) {
  const kickoff = new Date(match.kickoffUtc);

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
          <TeamCrest
            name={match.homeName}
            logoUrl={match.homeLogoUrl}
            primaryColor={match.homePrimaryColor}
            secondaryColor={match.homeSecondaryColor}
            size="lg"
          />
          <p className="text-sm font-semibold text-white">{match.homeName}</p>
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
          <TeamCrest
            name={match.awayName}
            logoUrl={match.awayLogoUrl}
            primaryColor={match.awayPrimaryColor}
            secondaryColor={match.awaySecondaryColor}
            size="lg"
          />
          <p className="text-sm font-semibold text-white">{match.awayName}</p>
        </div>
      </div>

      {match.stadium && (
        <p className="mt-3 text-center text-[11px] text-zinc-500">{match.stadium}</p>
      )}

      {footer && <div className="mt-4 border-t border-white/5 pt-3">{footer}</div>}
    </motion.article>
  );
}
