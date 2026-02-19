import type {
  Country,
  Competition,
  LeagueInfo,
  MatchResult,
  StatPeriod,
  LineupPlayer,
  MatchEvent,
  LineupTeam,
} from './types.js';

const BASE_URL = 'https://api.sportdb.dev';
const API_KEY = '7swYsPAUMZcB0oWL8KKfLVgG4hdwl33PcX5SPJp6';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiFetch<T>(path: string): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'X-API-Key': API_KEY,
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }

  const text = await res.text();
  if (!text) return [] as unknown as T;
  return JSON.parse(text);
}

export async function getCountries(): Promise<Country[]> {
  return apiFetch<Country[]>('/api/flashscore/football');
}

export async function getCompetitions(country: string): Promise<Competition[]> {
  return apiFetch<Competition[]>(`/api/flashscore/football/${country}`);
}

export async function getSeasons(country: string, league: string): Promise<LeagueInfo> {
  return apiFetch<LeagueInfo>(`/api/flashscore/football/${country}/${league}`);
}

export async function getResultsPage(
  country: string,
  league: string,
  season: string,
  page: number
): Promise<MatchResult[]> {
  try {
    const data = await apiFetch<MatchResult[]>(
      `/api/flashscore/football/${country}/${league}/${season}/results?page=${page}`
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getAllResults(
  country: string,
  league: string,
  season: string,
  onPage?: (page: number, count: number) => void
): Promise<MatchResult[]> {
  const all: MatchResult[] = [];
  let page = 1;

  while (true) {
    const results = await getResultsPage(country, league, season, page);
    if (results.length === 0) break;

    all.push(...results);
    onPage?.(page, results.length);
    page++;
    await sleep(300);
  }

  return all;
}

export async function getMatchStats(matchId: string): Promise<StatPeriod[]> {
  try {
    const data = await apiFetch<StatPeriod[]>(`/api/flashscore/match/${matchId}/stats`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getMatchLineups(matchId: string): Promise<{
  home: { formation: string; players: LineupPlayer[] } | null;
  away: { formation: string; players: LineupPlayer[] } | null;
}> {
  try {
    const data = await apiFetch<Array<{ home?: LineupPlayer[]; away?: LineupPlayer[] }>>(
      `/api/flashscore/match/${matchId}/lineups`
    );

    if (!Array.isArray(data) || data.length === 0) {
      return { home: null, away: null };
    }

    let homePlayers: LineupPlayer[] = [];
    let awayPlayers: LineupPlayer[] = [];

    for (const block of data) {
      if (block.home) homePlayers = block.home;
      if (block.away) awayPlayers = block.away;
    }

    const homeFormation = homePlayers[0]?.formation || '';
    const awayFormation = awayPlayers[0]?.formation || '';

    return {
      home: homePlayers.length > 0
        ? { formation: homeFormation, players: homePlayers }
        : null,
      away: awayPlayers.length > 0
        ? { formation: awayFormation, players: awayPlayers }
        : null,
    };
  } catch {
    return { home: null, away: null };
  }
}

export async function getMatchEvents(matchId: string): Promise<MatchEvent[]> {
  try {
    const data = await apiFetch<MatchEvent[]>(
      `/api/flashscore/match/${matchId}/events`
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

