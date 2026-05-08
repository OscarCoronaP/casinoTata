import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import {
  fetchLeagueFixtures,
  fetchStandings,
  fixtureToMatchPayload,
} from "./football.service.js";

/** Momios ficticios determinísticos por fixture (decoración UI). */
function fakeOdds(fixtureId: number) {
  const seed = (fixtureId % 97) / 97;
  const home = Number((1.7 + seed * 1.2).toFixed(2));
  const draw = Number((3.0 + (1 - seed) * 0.9).toFixed(2));
  const away = Number((2.2 + seed * 1.5).toFixed(2));
  return { oddsHome: home, oddsDraw: draw, oddsAway: away };
}

export async function syncMatchesAndStandings(): Promise<{
  matchesUpserted: number;
  standingsUpserted: number;
}> {
  const leagueId = env.API_FOOTBALL_LEAGUE_ID;
  const season = env.API_FOOTBALL_SEASON;

  const fixtures = await fetchLeagueFixtures(leagueId, season);
  let matchesUpserted = 0;
  const standingByTeam = new Map<
    number,
    {
      rank: number;
      points: number;
      played: number;
      win: number;
      draw: number;
      lose: number;
      goalsDiff: number;
      form?: string | null;
      description?: string | null;
      name: string;
      logo?: string | null;
    }
  >();

  try {
    const standingsGroups = await fetchStandings(leagueId, season);
    const flat = standingsGroups.flat();
    for (const row of flat) {
      standingByTeam.set(row.team.id, {
        rank: row.rank,
        points: row.points,
        played: row.all.played,
        win: row.all.win,
        draw: row.all.draw,
        lose: row.all.lose,
        goalsDiff: row.goalsDiff,
        form: row.form ?? null,
        description: row.description ?? row.group ?? null,
        name: row.team.name,
        logo: row.team.logo ?? null,
      });
    }
  } catch {
    // standings pueden fallar si la liga aún no tiene tabla; seguimos con partidos
  }

  for (const fx of fixtures) {
    const payload = fixtureToMatchPayload(fx);
    const odds = fakeOdds(payload.fixtureId);
    const hs = standingByTeam.get(payload.homeTeamId);
    const aws = standingByTeam.get(payload.awayTeamId);

    await prisma.match.upsert({
      where: { fixtureId: payload.fixtureId },
      create: {
        ...payload,
        ...odds,
        homeStanding: hs?.rank ?? null,
        awayStanding: aws?.rank ?? null,
        homeForm: hs?.form ?? null,
        awayForm: aws?.form ?? null,
      },
      update: {
        roundLabel: payload.roundLabel,
        kickoffUtc: payload.kickoffUtc,
        stadium: payload.stadium,
        venueCity: payload.venueCity,
        status: payload.status,
        homeGoals: payload.homeGoals,
        awayGoals: payload.awayGoals,
        homeStanding: hs?.rank ?? null,
        awayStanding: aws?.rank ?? null,
        homeForm: hs?.form ?? null,
        awayForm: aws?.form ?? null,
        ...odds,
        lastSyncedAt: new Date(),
      },
    });
    matchesUpserted += 1;
  }

  let standingsUpserted = 0;
  for (const [teamId, row] of standingByTeam) {
    await prisma.standingRow.upsert({
      where: {
        leagueId_season_teamId: {
          leagueId,
          season,
          teamId,
        },
      },
      create: {
        leagueId,
        season,
        teamId,
        teamName: row.name,
        logoUrl: row.logo,
        rank: row.rank,
        points: row.points,
        played: row.played,
        win: row.win,
        draw: row.draw,
        lose: row.lose,
        goalsDiff: row.goalsDiff,
        form: row.form,
        description: row.description,
      },
      update: {
        teamName: row.name,
        logoUrl: row.logo,
        rank: row.rank,
        points: row.points,
        played: row.played,
        win: row.win,
        draw: row.draw,
        lose: row.lose,
        goalsDiff: row.goalsDiff,
        form: row.form,
        description: row.description,
      },
    });
    standingsUpserted += 1;
  }

  return { matchesUpserted, standingsUpserted };
}
