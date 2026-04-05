/**
 * Client for the RapidAPI Flashscore4 API.
 * Replaces the old sportsdb.dev integration.
 */

import type {
  Country,
  Competition,
  TournamentDetails,
  MatchDetail,
  MatchStatEntry,
  MatchSummaryEvent,
  LineupSide,
  StandingsEntry,
  TournamentFixture,
} from '../types/sportdb.js';

const BASE_URL = 'https://flashscore4.p.rapidapi.com/api/flashscore/v2';
const API_KEY = process.env.RAPIDAPI_KEY || '';
const API_HOST = 'flashscore4.p.rapidapi.com';

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }

  const text = await res.text();
  if (!text) return [] as unknown as T;
  return JSON.parse(text);
}

// ============================================
// GENERAL
// ============================================

export async function getCountries(sportId = '1'): Promise<Country[]> {
  return apiFetch<Country[]>('/general/countries', { sport_id: sportId });
}

export async function getTournaments(countryId: string, sportId = '1'): Promise<Competition[]> {
  return apiFetch<Competition[]>('/general/tournaments', { country_id: countryId, sport_id: sportId });
}

// ============================================
// TOURNAMENTS
// ============================================

export async function getTournamentDetails(tournamentStageId: string): Promise<TournamentDetails> {
  return apiFetch<TournamentDetails>('/tournaments/details', { tournament_stage_id: tournamentStageId });
}

export async function getTournamentStandings(
  tournamentStageId: string,
  tournamentId: string,
  type = 'overall'
): Promise<StandingsEntry[]> {
  return apiFetch<StandingsEntry[]>('/tournaments/standings', {
    tournament_stage_id: tournamentStageId,
    tournament_id: tournamentId,
    type,
  });
}

export async function getTournamentFixtures(
  tournamentTemplateId: string,
  seasonId: string,
  page = '1'
): Promise<TournamentFixture[]> {
  return apiFetch<TournamentFixture[]>('/tournaments/fixtures', {
    tournament_template_id: tournamentTemplateId,
    season_id: seasonId,
    page,
  });
}

// ============================================
// MATCHES
// ============================================

export async function getMatchDetails(matchId: string): Promise<MatchDetail> {
  return apiFetch<MatchDetail>('/matches/details', { match_id: matchId });
}

export async function getMatchStats(matchId: string): Promise<Record<string, MatchStatEntry[]>> {
  return apiFetch<Record<string, MatchStatEntry[]>>('/matches/match/stats', { match_id: matchId });
}

export async function getMatchLineups(matchId: string): Promise<LineupSide[]> {
  return apiFetch<LineupSide[]>('/matches/match/lineups', { match_id: matchId });
}

export async function getMatchSummary(matchId: string): Promise<MatchSummaryEvent[]> {
  return apiFetch<MatchSummaryEvent[]>('/matches/match/summary', { match_id: matchId });
}

export async function getMatchCommentary(matchId: string): Promise<Array<{ minutes: string; description: string }>> {
  return apiFetch('/matches/match/commentary', { match_id: matchId });
}

// ============================================
// TEAMS
// ============================================

export async function getTeamResults(teamId: string, page = '1'): Promise<any[]> {
  return apiFetch('/teams/results', { team_id: teamId, page });
}

export async function getTeamDetails(teamUrl: string): Promise<{
  team_id: string;
  name: string;
  image_path: string;
  stadium: string;
  city: string;
  capacity: string;
}> {
  return apiFetch('/teams/details', { team_url: teamUrl });
}
