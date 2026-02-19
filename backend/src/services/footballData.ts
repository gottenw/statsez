import * as sportdb from './sportdb.js';
import { getCache, setCache } from './cache.js';
import type {
  FixtureResponse,
  LeagueResponse,
  TeamResponse,
  StatsResponse,
  EventsResponse,
  LineupsResponse,
  MatchResult,
  StandingsEntry,
} from '../types/sportdb.js';

// ============================================
// LEAGUE REGISTRY
// Maps competition ID → upstream API path info
// Cached in PostgreSQL (24h) + in-memory Map
// ============================================

interface LeagueEntry {
  id: string;
  name: string;
  countryName: string;
  countryParam: string;
  leagueSlug: string;
  leagueParam: string;
  currentSeason: string;
}

const leagueRegistry = new Map<string, LeagueEntry>();
let registryBuilt = false;
let registryBuilding: Promise<void> | null = null;

async function ensureRegistry(): Promise<void> {
  if (registryBuilt) return;
  if (registryBuilding) {
    await registryBuilding;
    return;
  }
  registryBuilding = buildRegistry();
  await registryBuilding;
  registryBuilding = null;
}

async function buildRegistry(): Promise<void> {
  // 1) Try loading from PostgreSQL cache first
  try {
    const cached = await getCache<LeagueEntry[]>('football', 'league-registry', {});
    if (cached && cached.length > 0) {
      // Validate that cached entries have currentSeason (invalidate old format)
      const hasSeasons = cached.some(e => e.currentSeason !== undefined && e.currentSeason !== '');
      if (!hasSeasons) {
        console.log('[Registry] Cache outdated (missing seasons), rebuilding from API...');
      } else {
        for (const entry of cached) {
          entry.currentSeason = entry.currentSeason || '';
          leagueRegistry.set(entry.id, entry);
        }
        registryBuilt = true;
        console.log(`[Registry] Loaded ${cached.length} leagues from cache`);
        return;
      }
    }
  } catch {
    // cache miss or error, build from API
  }

  // 2) Build from sportsdb.dev API
  try {
    const countries = await sportdb.getCountries();
    console.log(`[Registry] Building from API: ${countries.length} countries...`);

    const BATCH_SIZE = 50;
    for (let i = 0; i < countries.length; i += BATCH_SIZE) {
      const batch = countries.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (country) => {
          const countryParam = `${country.slug}:${country.id}`;
          const competitions = await sportdb.getCompetitions(countryParam);
          return { country, countryParam, competitions };
        })
      );

      const newEntries: { country: typeof countries[0]; countryParam: string; comp: { id: string; name: string; slug: string } }[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { country, countryParam, competitions } = result.value;
          for (const comp of competitions) {
            newEntries.push({ country, countryParam, comp });
          }
        }
      }

      // Batch-fetch seasons for all new entries
      const SEASON_BATCH = 50;
      for (let s = 0; s < newEntries.length; s += SEASON_BATCH) {
        const seasonBatch = newEntries.slice(s, s + SEASON_BATCH);
        const seasonResults = await Promise.allSettled(
          seasonBatch.map(async (entry) => {
            const leagueParam = `${entry.comp.slug}:${entry.comp.id}`;
            const info = await sportdb.getSeasons(entry.countryParam, leagueParam);
            const season = info.seasons && info.seasons.length > 0 ? info.seasons[0].season : '';
            return { ...entry, leagueParam, season };
          })
        );

        for (const sr of seasonResults) {
          if (sr.status === 'fulfilled') {
            const { country, countryParam, comp, leagueParam, season } = sr.value;
            leagueRegistry.set(comp.id, {
              id: comp.id,
              name: comp.name,
              countryName: country.name,
              countryParam,
              leagueSlug: comp.slug,
              leagueParam,
              currentSeason: season,
            });
          }
        }
      }

      console.log(`[Registry] Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(countries.length / BATCH_SIZE)}: ${leagueRegistry.size} leagues`);
    }

    registryBuilt = true;
    console.log(`[Registry] Built: ${leagueRegistry.size} leagues total`);

    // 3) Save to PostgreSQL cache (24h TTL)
    const entries = Array.from(leagueRegistry.values());
    await setCache({ sport: 'football', endpoint: 'league-registry', params: {}, ttlSeconds: 86400 }, entries);
    console.log(`[Registry] Saved to cache`);
  } catch (error) {
    console.error('[Registry] Failed to build:', error);
  }
}

// Start building in background on module load
ensureRegistry().catch(() => {});

async function resolveLeagueSeason(entry: LeagueEntry, explicitSeason?: string): Promise<string | null> {
  if (explicitSeason) return explicitSeason;
  if (entry.currentSeason) return entry.currentSeason;
  try {
    const info = await sportdb.getSeasons(entry.countryParam, entry.leagueParam);
    if (info.seasons && info.seasons.length > 0) {
      entry.currentSeason = info.seasons[0].season;
      return entry.currentSeason;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================
// LEAGUE SEASONS
// ============================================

export async function getLeagueSeasons(leagueId: string): Promise<{
  league: string;
  country: string;
  seasons: string[];
} | null> {
  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);
  if (!entry) return null;

  try {
    const info = await sportdb.getSeasons(entry.countryParam, entry.leagueParam);
    const seasons = info.seasons?.map((s: { season: string }) => s.season) || [];
    return { league: entry.name, country: entry.countryName, seasons };
  } catch {
    return null;
  }
}

// ============================================
// LEAGUES
// ============================================

export async function getLeagues(): Promise<LeagueResponse[]> {
  await ensureRegistry();

  const leagues: LeagueResponse[] = [];
  for (const entry of leagueRegistry.values()) {
    leagues.push({
      id: entry.id,
      name: entry.name,
      country: entry.countryName,
      season: entry.currentSeason,
      slug: entry.leagueSlug,
    });
  }
  return leagues;
}

export async function getLeaguesByCountry(country: string): Promise<LeagueResponse[]> {
  await ensureRegistry();

  const countryLower = country.toLowerCase();
  const leagues: LeagueResponse[] = [];

  for (const entry of leagueRegistry.values()) {
    if (entry.countryName.toLowerCase() === countryLower) {
      leagues.push({
        id: entry.id,
        name: entry.name,
        country: entry.countryName,
        season: entry.currentSeason,
        slug: entry.leagueSlug,
      });
    }
  }
  return leagues;
}

// ============================================
// FIXTURES
// ============================================

function convertMatchResult(match: MatchResult): FixtureResponse {
  return {
    id: match.eventId,
    date: match.startDateTimeUtc,
    round: match.round || match.eventStage || '',
    homeTeam: {
      name: match.homeName,
      shortName: match.home3CharName,
    },
    awayTeam: {
      name: match.awayName,
      shortName: match.away3CharName,
    },
    score: {
      fullTime: {
        home: parseInt(match.homeFullTimeScore) || 0,
        away: parseInt(match.awayFullTimeScore) || 0,
      },
      halfTime: {
        home: parseInt(match.homeResultPeriod2) || 0,
        away: parseInt(match.awayResultPeriod2) || 0,
      },
    },
    status: match.homeFullTimeScore ? 'FT' : 'NS',
  };
}

export async function getFixturesByLeague(
  leagueId: string,
  options?: {
    round?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
    season?: string;
  }
): Promise<{ league: string; fixtures: FixtureResponse[] } | null> {
  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);
  if (!entry) return null;

  const season = await resolveLeagueSeason(entry, options?.season);
  if (!season) return null;

  const results = await sportdb.getAllResults(entry.countryParam, entry.leagueParam, season);
  let fixtures = results.map(convertMatchResult);

  if (options?.round) {
    fixtures = fixtures.filter(f => f.round.toLowerCase().includes(options.round!.toLowerCase()));
  }
  if (options?.team) {
    const teamLower = options.team.toLowerCase();
    fixtures = fixtures.filter(f =>
      f.homeTeam.name.toLowerCase().includes(teamLower) ||
      f.awayTeam.name.toLowerCase().includes(teamLower)
    );
  }
  if (options?.dateFrom) {
    const from = new Date(options.dateFrom);
    fixtures = fixtures.filter(f => new Date(f.date) >= from);
  }
  if (options?.dateTo) {
    const to = new Date(options.dateTo);
    fixtures = fixtures.filter(f => new Date(f.date) <= to);
  }

  return { league: entry.name, fixtures };
}

export async function getAllFixtures(options?: {
  league?: string;
  team?: string;
  round?: string;
  date?: string;
}): Promise<Array<{ league: string; country: string; fixture: FixtureResponse }>> {
  if (options?.league) {
    await ensureRegistry();
    const entry = leagueRegistry.get(options.league);
    if (!entry) return [];
    const result = await getFixturesByLeague(options.league, {
      team: options.team,
      round: options.round,
      dateFrom: options.date,
      dateTo: options.date,
    });
    if (!result) return [];
    return result.fixtures.map(f => ({
      league: result.league,
      country: entry.countryName,
      fixture: f,
    }));
  }
  return [];
}

export async function getFixtureById(matchId: string): Promise<{
  fixture: FixtureResponse;
  league: string;
  country: string;
  stats: Record<string, [string, string]>;
} | null> {
  try {
    const stats = await sportdb.getMatchStats(matchId);
    const statsMap: Record<string, [string, string]> = {};
    if (stats.length > 0) {
      for (const period of stats) {
        for (const stat of period.stats) {
          statsMap[stat.statName] = [stat.homeValue, stat.awayValue];
        }
      }
    }
    return {
      fixture: {
        id: matchId,
        date: '',
        round: '',
        homeTeam: { name: '' },
        awayTeam: { name: '' },
        score: { fullTime: { home: 0, away: 0 }, halfTime: { home: 0, away: 0 } },
        status: 'FT',
      },
      league: '',
      country: '',
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

  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);
  if (!entry) return [];

  const season = await resolveLeagueSeason(entry, seasonParam);
  if (!season) return [];

  const results = await sportdb.getAllResults(entry.countryParam, entry.leagueParam, season);
  const teams = new Map<string, TeamResponse>();

  for (const match of results) {
    if (!teams.has(match.homeName)) {
      teams.set(match.homeName, { name: match.homeName, shortName: match.home3CharName, country: entry.countryName });
    }
    if (!teams.has(match.awayName)) {
      teams.set(match.awayName, { name: match.awayName, shortName: match.away3CharName, country: entry.countryName });
    }
  }
  return Array.from(teams.values());
}

export async function getTeamFixtures(teamName: string, leagueId?: string, seasonParam?: string): Promise<Array<{
  league: string;
  country: string;
  fixture: FixtureResponse;
}>> {
  if (!leagueId) return [];

  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);
  if (!entry) return [];

  const season = await resolveLeagueSeason(entry, seasonParam);
  if (!season) return [];

  const results = await sportdb.getAllResults(entry.countryParam, entry.leagueParam, season);
  const teamLower = teamName.toLowerCase();

  const filtered = results.filter(m =>
    m.homeName.toLowerCase().includes(teamLower) ||
    m.awayName.toLowerCase().includes(teamLower) ||
    m.home3CharName?.toLowerCase() === teamLower ||
    m.away3CharName?.toLowerCase() === teamLower
  );

  return filtered.map(m => ({
    league: entry.name,
    country: entry.countryName,
    fixture: convertMatchResult(m),
  }));
}

// ============================================
// STANDINGS (via sportsdb.dev direct endpoint)
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
  if (!entry) return null;

  const season = await resolveLeagueSeason(entry, seasonParam);
  if (!season) return null;

  const data = await sportdb.getStandings(entry.countryParam, entry.leagueParam, season);
  if (!data || data.length === 0) return null;

  const standings = data.map((e: StandingsEntry) => {
    const goalsParts = e.goals ? e.goals.split(':') : ['0', '0'];
    const goalsFor = parseInt(goalsParts[0]) || 0;
    const goalsAgainst = parseInt(goalsParts[1]) || 0;

    return {
      position: parseInt(e.rank) || 0,
      team: e.teamName,
      teamId: e.teamId,
      played: parseInt(e.matches) || 0,
      won: parseInt(e.wins || e.winsRegular) || 0,
      drawn: parseInt(e.draws) || 0,
      lost: parseInt(e.lossesRegular) || 0,
      goalsFor,
      goalsAgainst,
      goalDifference: parseInt(e.goalDiff) || (goalsFor - goalsAgainst),
      points: parseInt(e.points) || 0,
    };
  });

  return { league: entry.name, country: entry.countryName, season, standings };
}

// ============================================
// MATCH DETAILS (stats, events, lineups)
// ============================================

export async function getMatchStats(matchId: string): Promise<StatsResponse | null> {
  try {
    const stats = await sportdb.getMatchStats(matchId);
    if (stats && stats.length > 0) {
      return { matchId, periods: stats };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getMatchEvents(matchId: string): Promise<EventsResponse | null> {
  try {
    const events = await sportdb.getMatchEvents(matchId);
    if (events && events.length > 0) {
      return { matchId, events };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getMatchLineups(matchId: string): Promise<LineupsResponse | null> {
  try {
    const lineups = await sportdb.getMatchLineups(matchId);
    if (lineups.home || lineups.away) {
      return { matchId, home: lineups.home, away: lineups.away };
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================
// LEAGUE STATS (computed from results)
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
  await ensureRegistry();
  const entry = leagueRegistry.get(leagueId);
  if (!entry) return null;

  const season = await resolveLeagueSeason(entry, seasonParam);
  if (!season) return null;

  const results = await sportdb.getAllResults(entry.countryParam, entry.leagueParam, season);
  if (results.length === 0) return null;

  let totalGoals = 0;
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  for (const match of results) {
    const homeScore = parseInt(match.homeFullTimeScore) || 0;
    const awayScore = parseInt(match.awayFullTimeScore) || 0;
    totalGoals += homeScore + awayScore;
    if (homeScore > awayScore) homeWins++;
    else if (awayScore > homeScore) awayWins++;
    else draws++;
  }

  return {
    league: entry.name,
    stats: {
      totalMatches: results.length,
      totalGoals,
      avgGoalsPerMatch: Math.round((totalGoals / results.length) * 100) / 100,
      homeWins,
      awayWins,
      draws,
    },
  };
}
