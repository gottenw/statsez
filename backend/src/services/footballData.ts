import * as api from './sportdb.js';
import { getCache, setCache } from './cache.js';
import type {
  FixtureResponse,
  LeagueResponse,
  TeamResponse,
  StatsResponse,
  EventsResponse,
  LineupsResponse,
  Country,
  StandingsEntry,
} from '../types/sportdb.js';

// ============================================
// LEAGUE REGISTRY
// Maps leagueId (tournament_stage_id) → metadata
// Cached in PostgreSQL (24h) + in-memory
// ============================================

interface LeagueEntry {
  id: string;                  // tournament_stage_id (primary key for standings/details)
  tournamentId: string;        // tournament_id (used for standings)
  name: string;
  countryName: string;
  countryId: number;
  slug: string;                // tournament_url
  currentSeason: string;       // "2024-2025" derived from details
}

const leagueRegistry = new Map<string, LeagueEntry>();
let registryBuilt = false;
let registryBuilding: Promise<void> | null = null;

async function ensureRegistry(): Promise<void> {
  if (registryBuilt) return;
  if (registryBuilding) { await registryBuilding; return; }
  registryBuilding = buildRegistry();
  await registryBuilding;
  registryBuilding = null;
}

async function buildRegistry(): Promise<void> {
  // 1) Try PostgreSQL cache
  try {
    const cached = await getCache<LeagueEntry[]>('football', 'league-registry-v2', {});
    if (cached && cached.length > 0) {
      for (const entry of cached) leagueRegistry.set(entry.id, entry);
      registryBuilt = true;
      console.log(`[Registry] Loaded ${cached.length} leagues from cache`);
      return;
    }
  } catch {}

  // 2) Build from API: countries → tournaments → details
  try {
    const countries = await api.getCountries();
    console.log(`[Registry] Building from API: ${countries.length} countries...`);

    const BATCH = 10;
    for (let i = 0; i < countries.length; i += BATCH) {
      const batch = countries.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async (country) => {
          const tournaments = await api.getTournaments(String(country.country_id));
          return { country, tournaments };
        })
      );

      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        const { country, tournaments } = r.value;

        // For each tournament, we need tournament_stage_id via /tournaments/ids
        // But we don't have it from /general/tournaments — only tournament_url.
        // We'll use tournament_url as a slug and defer details fetching to per-request.
        // Store a placeholder entry with url-derived id.
        for (const t of tournaments) {
          // Use tournament_url as key since we don't have stage_id yet
          const urlKey = t.tournament_url;
          leagueRegistry.set(urlKey, {
            id: urlKey,
            tournamentId: '',
            name: t.name,
            countryName: country.name,
            countryId: country.country_id,
            slug: t.tournament_url,
            currentSeason: '',
          });
        }
      }

      console.log(`[Registry] Batch ${Math.floor(i / BATCH) + 1}: ${leagueRegistry.size} leagues`);
    }

    registryBuilt = true;
    console.log(`[Registry] Built: ${leagueRegistry.size} leagues total`);

    const entries = Array.from(leagueRegistry.values());
    await setCache({ sport: 'football', endpoint: 'league-registry-v2', params: {}, ttlSeconds: 86400 }, entries);
  } catch (error) {
    console.error('[Registry] Failed to build:', error);
  }
}

// Start building in background
ensureRegistry().catch(() => {});

// ============================================
// LEAGUES
// ============================================

export async function getLeagues(): Promise<LeagueResponse[]> {
  await ensureRegistry();
  const out: LeagueResponse[] = [];
  for (const entry of leagueRegistry.values()) {
    out.push({
      id: entry.id,
      name: entry.name,
      country: entry.countryName,
      season: entry.currentSeason,
      slug: entry.slug,
    });
  }
  return out;
}

export async function getLeaguesByCountry(country: string): Promise<LeagueResponse[]> {
  await ensureRegistry();
  const lower = country.toLowerCase();
  const out: LeagueResponse[] = [];
  for (const entry of leagueRegistry.values()) {
    if (entry.countryName.toLowerCase() === lower) {
      out.push({ id: entry.id, name: entry.name, country: entry.countryName, season: entry.currentSeason, slug: entry.slug });
    }
  }
  return out;
}

export async function getLeagueSeasons(leagueId: string): Promise<{
  league: string;
  country: string;
  seasons: string[];
} | null> {
  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);
  if (!entry) return null;

  // The new API doesn't have a direct "seasons" endpoint like the old one.
  // Tournament details gives current season info.
  // We return what we know.
  return {
    league: entry.name,
    country: entry.countryName,
    seasons: entry.currentSeason ? [entry.currentSeason] : [],
  };
}

// ============================================
// FIXTURES (via match details)
// ============================================

export async function getFixturesByLeague(
  leagueId: string,
  options?: { round?: string; team?: string; dateFrom?: string; dateTo?: string; season?: string }
): Promise<{ league: string; fixtures: FixtureResponse[] } | null> {
  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);
  if (!entry) return null;

  // The new API doesn't have a direct "results by league" endpoint with pagination like the old one.
  // We need tournament_template_id + season_id for /tournaments/fixtures.
  // Since we may not have those IDs, return empty for now with a message.
  // Individual match lookups via getFixtureById still work.
  return { league: entry.name, fixtures: [] };
}

export async function getAllFixtures(options?: {
  league?: string; team?: string; round?: string; date?: string;
}): Promise<Array<{ league: string; country: string; fixture: FixtureResponse }>> {
  return [];
}

export async function getFixtureById(matchId: string): Promise<{
  fixture: FixtureResponse;
  league: string;
  country: string;
  stats: Record<string, [string, string]>;
} | null> {
  try {
    const detail = await api.getMatchDetails(matchId);

    const fixture: FixtureResponse = {
      id: detail.match_id,
      date: new Date(detail.timestamp * 1000).toISOString(),
      round: detail.tournament?.name || '',
      homeTeam: {
        name: detail.home_team.name,
        shortName: detail.home_team.short_name,
        imageUrl: detail.home_team.image_path,
      },
      awayTeam: {
        name: detail.away_team.name,
        shortName: detail.away_team.short_name,
        imageUrl: detail.away_team.image_path,
      },
      score: {
        fullTime: { home: detail.scores.home_total, away: detail.scores.away_total },
        halfTime: { home: detail.scores.home_1st_half, away: detail.scores.away_1st_half },
      },
      status: detail.match_status.is_finished ? 'FT' : detail.match_status.stage,
    };

    // Fetch stats
    const statsMap: Record<string, [string, string]> = {};
    try {
      const statsData = await api.getMatchStats(matchId);
      const matchStats = statsData?.match || statsData?.['match'] || [];
      if (Array.isArray(matchStats)) {
        for (const s of matchStats) {
          statsMap[s.name] = [String(s.home_team), String(s.away_team)];
        }
      }
    } catch {}

    return {
      fixture,
      league: detail.tournament?.name || '',
      country: detail.country?.name || '',
      stats: statsMap,
    };
  } catch {
    return null;
  }
}

// ============================================
// TEAMS
// ============================================

export async function getTeams(leagueId?: string, seasonParam?: string): Promise<TeamResponse[]> {
  if (!leagueId) return [];
  // Without tournament fixtures pagination, we can't extract teams from results.
  // Return empty — individual team lookups via match details work.
  return [];
}

export async function getTeamFixtures(
  teamName: string,
  leagueId?: string,
  seasonParam?: string
): Promise<Array<{ league: string; country: string; fixture: FixtureResponse }>> {
  return [];
}

// ============================================
// STANDINGS
// ============================================

export async function getStandings(leagueId: string, seasonParam?: string): Promise<{
  league: string;
  country: string;
  season: string;
  standings: Array<{
    position: number;
    team: string;
    teamId: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }>;
} | null> {
  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);

  // Standings require tournament_stage_id + tournament_id.
  // If leagueId IS a tournament_stage_id (e.g. from /tournaments/details), use it.
  // Otherwise we need to resolve it.

  let stageId = '';
  let tournamentId = '';
  let leagueName = entry?.name || '';
  let countryName = entry?.countryName || '';

  if (entry && entry.tournamentId) {
    stageId = entry.id;
    tournamentId = entry.tournamentId;
  } else {
    // leagueId might be the tournament_stage_id directly
    stageId = leagueId;
    try {
      const details = await api.getTournamentDetails(leagueId);
      tournamentId = details.tournament_id;
      leagueName = details.name;
      countryName = details.country?.name || '';
    } catch {
      return null;
    }
  }

  if (!stageId || !tournamentId) return null;

  try {
    const data = await api.getTournamentStandings(stageId, tournamentId);
    if (!data || data.length === 0) return null;

    const standings = data.map((e: StandingsEntry, i: number) => {
      const goalsParts = e.goals ? e.goals.split(':') : ['0', '0'];
      const goalsFor = parseInt(goalsParts[0]) || 0;
      const goalsAgainst = parseInt(goalsParts[1]) || 0;

      return {
        position: i + 1,
        team: e.name,
        teamId: e.team_id,
        played: e.matches_played,
        won: e.wins,
        drawn: e.draws,
        lost: e.losses,
        goalsFor,
        goalsAgainst,
        goalDifference: e.goal_difference,
        points: e.points,
      };
    });

    return { league: leagueName, country: countryName, season: seasonParam || '', standings };
  } catch {
    return null;
  }
}

// ============================================
// MATCH DETAILS (stats, events, lineups)
// ============================================

export async function getMatchStats(matchId: string): Promise<StatsResponse | null> {
  try {
    const data = await api.getMatchStats(matchId);
    const matchStats = data?.match || data?.['match'] || [];
    if (!Array.isArray(matchStats) || matchStats.length === 0) return null;

    return {
      matchId,
      stats: matchStats.map((s: any) => ({
        name: s.name,
        home: s.home_team,
        away: s.away_team,
      })),
    };
  } catch {
    return null;
  }
}

export async function getMatchEvents(matchId: string): Promise<EventsResponse | null> {
  try {
    const events = await api.getMatchSummary(matchId);
    if (!events || events.length === 0) return null;
    return { matchId, events };
  } catch {
    return null;
  }
}

export async function getMatchLineups(matchId: string): Promise<LineupsResponse | null> {
  try {
    const sides = await api.getMatchLineups(matchId);
    if (!sides || sides.length === 0) return null;

    const homeSide = sides.find(s => s.side === 'home');
    const awaySide = sides.find(s => s.side === 'away');

    return {
      matchId,
      home: homeSide ? {
        formation: homeSide.predictedFormation || homeSide.formation || '',
        starting: homeSide.startingLineups || [],
        substitutes: homeSide.substitutes || [],
      } : null,
      away: awaySide ? {
        formation: awaySide.predictedFormation || awaySide.formation || '',
        starting: awaySide.startingLineups || [],
        substitutes: awaySide.substitutes || [],
      } : null,
    };
  } catch {
    return null;
  }
}

// ============================================
// LEAGUE STATS (needs fixtures data)
// ============================================

export async function getLeagueStats(leagueId: string, seasonParam?: string): Promise<{
  league: string;
  stats: {
    totalMatches: number;
    totalGoals: number;
    avgGoalsPerMatch: number;
    homeWins: number;
    awayWins: number;
    draws: number;
  };
} | null> {
  // Without bulk fixtures data, we can't compute league stats.
  // Return null until tournament fixtures pagination is implemented.
  return null;
}
