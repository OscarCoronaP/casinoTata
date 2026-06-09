"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { Match } from "@/types/match";
//import { cn } from "@/lib/utils";
import { TeamCrest } from "@/components/team/TeamCrest";

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  NS:   { bg: "rgba(79,163,224,0.1)",   color: "#4FA3E0", border: "rgba(79,163,224,0.25)" },
  LIVE: { bg: "rgba(200,16,46,0.18)",   color: "#FF4D6D", border: "rgba(200,16,46,0.4)"  },
  HT:   { bg: "rgba(200,16,46,0.12)",   color: "#FF4D6D", border: "rgba(200,16,46,0.3)"  },
  FT:   { bg: "rgba(245,166,35,0.1)",   color: "#F5A623", border: "rgba(245,166,35,0.3)" },
  PST:  { bg: "rgba(138,165,194,0.1)",  color: "#8BA5C2", border: "rgba(138,165,194,0.2)"},
  CANC: { bg: "rgba(138,165,194,0.08)", color: "#4D6B8A", border: "rgba(77,107,138,0.2)" },
};

export function MatchCardMundial({
  match,
  footer,
}: {
  match: Match;
  footer?: ReactNode;
}) {
  const kickoff = new Date(match.kickoffUtc);
  const statusStyle = STATUS_STYLES[match.status] ?? STATUS_STYLES.NS;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl p-4"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--wc-crimson)",
        boxShadow: "0 8px 32px -12px rgba(0,10,30,0.6)",
      }}
    >
      {/* Header: jornada + estado */}
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider">
        <span style={{ color: "var(--muted-2)" }}>{match.roundLabel}</span>
        <span
          className="rounded-full px-2 py-0.5 font-semibold"
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.border}`,
          }}
        >
          {match.status}
        </span>
      </div>

      {/* Equipos + marcador */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <TeamCrest
            name={match.homeName}
            logoUrl={match.homeLogoUrl}
            primaryColor={match.homePrimaryColor}
            secondaryColor={match.homeSecondaryColor}
            size="lg"
          />
          <p className="text-sm font-semibold" style={{ color: "#EDF4FF" }}>
            {match.homeName}
          </p>
        </div>

        <div className="flex flex-col items-center px-2 text-center">
          <p className="text-[11px]" style={{ color: "var(--muted-2)" }}>
            {kickoff.toLocaleDateString("es-MX", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </p>
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--wc-sky)" }}
          >
            {kickoff.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div
            className="mt-2 text-2xl font-black tracking-tight"
            style={{
              color: match.homeGoals != null ? "var(--wc-gold)" : "#EDF4FF",
              fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
              letterSpacing: "0.04em",
              fontSize: "1.75rem",
            }}
          >
            {match.homeGoals ?? "—"}
            <span className="mx-1" style={{ color: "var(--muted-2)" }}>:</span>
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
          <p className="text-sm font-semibold" style={{ color: "#EDF4FF" }}>
            {match.awayName}
          </p>
        </div>
      </div>

      {/* Estadio */}
      {match.stadium && (
        <p className="mt-3 text-center text-[11px]" style={{ color: "var(--muted-2)" }}>
          {match.stadium}
        </p>
      )}

      {/* Footer (ScorePicker u otro) */}
      {footer && (
        <div
          className="mt-4 pt-3"
          style={{ borderTop: "1px solid rgba(79,163,224,0.1)" }}
        >
          {footer}
        </div>
      )}
    </motion.article>
  );
}
