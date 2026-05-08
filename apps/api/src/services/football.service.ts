import { MatchStatus } from "@prisma/client";
import { env } from "../config/env.js";

type ApiResponse<T> = {
  errors?: { message: string }[];
  results?: number;
  response?: T;
};

function mapApiStatus(short: string | undefined): MatchStatus {
  switch (short) {
    case "TBD":
    case "NS":
      return MatchStatus.NS;
    case "1H":
    case "2H":
    case "ET":
    case "P":
    case "LIVE":
      return MatchStatus.LIVE;
    case "HT":
      return MatchStatus.HT;
    case "FT":
    case "AET":
    case "PEN":
      return MatchStatus.FT;
    case "PST":
      return MatchStatus.PST;
    case "CANC":
    case "ABD":
      return MatchStatus.CANC;
    default:
      return MatchStatus.NS;
  }
}

async function apiFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  if (!env.API_FOOTBALL_KEY) {
    throw new Error(
      "API_FOOTBALL_KEY no configurada. Registra una clave en API-Football.",
    );
  }
  const url = new URL(path, env.API_FOOTBALL_BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { "x-apisports-key": env.API_FOOTBALL_KEY },
  });
  if (!res.ok) {
    throw new Error(`API-Football HTTP ${res.status}`);
  }
  const body = (await res.json()) as ApiResponse<T>;
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  return body.response as T;
}

export type FootballFixture = {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    venue?: { name?: string; city?: string };
    status: { short?: string; long?: string };
  };
  league: { round?: string };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: { home: number | null; away: number | null };
};

export async function fetchLeagueFixtures(
  leagueId: number,
  season: number,
): Promise<FootballFixture[]> {
  return apiFetch<FootballFixture[]>("/fixtures", {
    league: String(leagueId),
    season: String(season),
  });
}

export async function fetchLiveFixtures(leagueId: number): Promise<FootballFixture[]> {
  return apiFetch<FootballFixture[]>("/fixtures", {
    live: "all",
    league: String(leagueId),
  });
}

export type StandingEntry = {
  rank: number;
  points: number;
  goalsDiff: number;
  group?: string;
  form?: string;
  description?: string;
  all: { played: number; win: number; draw: number; lose: number };
  team: { id: number; name: string; logo?: string };
};

export async function fetchStandings(
  leagueId: number,
  season: number,
): Promise<StandingEntry[][]> {
  return apiFetch<StandingEntry[][]>("/standings", {
    league: String(leagueId),
    season: String(season),
  });
}

export function fixtureToMatchPayload(fx: FootballFixture) {
  const status = mapApiStatus(fx.fixture.status.short);
  const homeGoals =
    fx.goals.home === null || fx.goals.home === undefined
      ? null
      : fx.goals.home;
  const awayGoals =
    fx.goals.away === null || fx.goals.away === undefined
      ? null
      : fx.goals.away;
  return {
    fixtureId: fx.fixture.id,
    leagueId: env.API_FOOTBALL_LEAGUE_ID,
    season: env.API_FOOTBALL_SEASON,
    roundLabel: fx.league.round ?? "Jornada",
    kickoffUtc: new Date(fx.fixture.timestamp * 1000),
    stadium: fx.fixture.venue?.name ?? null,
    venueCity: fx.fixture.venue?.city ?? null,
    status,
    homeTeamId: fx.teams.home.id,
    homeName: fx.teams.home.name,
    homeLogoUrl: fx.teams.home.logo ?? null,
    awayTeamId: fx.teams.away.id,
    awayName: fx.teams.away.name,
    awayLogoUrl: fx.teams.away.logo ?? null,
    homeGoals,
    awayGoals,
  };
}
