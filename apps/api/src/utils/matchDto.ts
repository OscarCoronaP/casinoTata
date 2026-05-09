import type { Match, Round, Team } from "@prisma/client";
import { normalizeLogoUrl } from "./logoUrl.js";

export type MatchPayload = {
  id: string;
  roundId: string;
  roundLabel: string;
  kickoffUtc: string;
  stadium: string | null;
  venueCity: null;
  status: string;
  homeTeamId: string;
  homeName: string;
  homeLogoUrl: string | null;
  homePrimaryColor: string;
  homeSecondaryColor: string;
  awayTeamId: string;
  awayName: string;
  awayLogoUrl: string | null;
  awayPrimaryColor: string;
  awaySecondaryColor: string;
  homeGoals: number | null;
  awayGoals: number | null;
  homeStanding: null;
  awayStanding: null;
  homeForm: null;
  awayForm: null;
  oddsHome: null;
  oddsDraw: null;
  oddsAway: null;
};

export function toMatchPayload(
  m: Match & { round: Round; homeTeam: Team; awayTeam: Team },
): MatchPayload {
  return {
    id: m.id,
    roundId: m.roundId,
    roundLabel: m.round.name,
    kickoffUtc: m.kickoffUtc.toISOString(),
    stadium: m.stadium,
    venueCity: null,
    status: m.status,
    homeTeamId: m.homeTeamId,
    homeName: m.homeTeam.name,
    homeLogoUrl: normalizeLogoUrl(m.homeTeam.logoUrl),
    homePrimaryColor: m.homeTeam.primaryColor,
    homeSecondaryColor: m.homeTeam.secondaryColor,
    awayTeamId: m.awayTeamId,
    awayName: m.awayTeam.name,
    awayLogoUrl: normalizeLogoUrl(m.awayTeam.logoUrl),
    awayPrimaryColor: m.awayTeam.primaryColor,
    awaySecondaryColor: m.awayTeam.secondaryColor,
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    homeStanding: null,
    awayStanding: null,
    homeForm: null,
    awayForm: null,
    oddsHome: null,
    oddsDraw: null,
    oddsAway: null,
  };
}
