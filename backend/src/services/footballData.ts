

import * as sportdb from './sportdb.js';
import * as localData from './localData.js';
import type { 
  FixtureResponse, 
  LeagueResponse, 
  TeamResponse, 
  StatsResponse,
  EventsResponse,
  LineupsResponse,
  CollectedMatch 
} from '../types/sportdb.js';






const USE_ONLINE_API = process.env.USE_ONLINE_API !== 'false';






export async function getLeagues(): Promise<LeagueResponse[]> {
  const leagues: LeagueResponse[] = [];
  
  
  const localLeagues = localData.listAvailableLeagues();
  for (const l of localLeagues) {
    const data = localData.loadLeagueData(l.filename);
    if (data) {
      leagues.push({
        id: `${l.country}-${l.league}-${l.season}`,
        name: data.league,
        country: l.country,
        season: l.season,
        slug: `${l.country}-${l.league}`,
      });
    }
  }
  
  
  if (USE_ONLINE_API) {
    try {
      const countries = await sportdb.getCountries();
      for (const country of countries.slice(0, 10)) { 
        const competitions = await sportdb.getCompetitions(`${country.slug}:${country.id}`);
        for (const comp of competitions) {
          
          const exists = leagues.some(l => 
            l.country === country.slug && 
            l.name.toLowerCase() === comp.name.toLowerCase()
          );
          if (!exists) {
            leagues.push({
              id: comp.id,
              name: comp.name,
              country: country.slug,
              season: '', 
              slug: comp.slug,
            });
          }
        }
      }
    } catch (error) {
      console.warn('API online indisponível, usando apenas dados locais');
    }
  }
  
  return leagues;
}


export function getLeaguesByCountry(country: string): LeagueResponse[] {
  const localLeagues = localData.listLeaguesByCountry(country);
  
  return localLeagues.map(l => {
    const data = localData.loadLeagueData(l.filename);
    return {
      id: l.filename.replace('.json', ''),
      name: l.name,
      country: l.league,
      season: l.season,
      slug: `${country}-${l.league}`,
    };
  });
}






function convertToFixture(match: CollectedMatch): FixtureResponse {
  return {
    id: match.id,
    date: match.date,
    round: match.round,
    homeTeam: {
      name: match.homeTeam,
    },
    awayTeam: {
      name: match.awayTeam,
    },
    score: {
      fullTime: {
        home: match.homeScore,
        away: match.awayScore,
      },
      halfTime: {
        home: match.htHome,
        away: match.htAway,
      },
    },
    status: match.status,
  };
}


export function getFixturesByLeague(
  leagueId: string,
  options?: {
    round?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): { league: string; fixtures: FixtureResponse[] } | null {
  const data = localData.loadLeagueData(`${leagueId}.json`) || 
               localData.findLeagueBySlug(leagueId);
  
  if (!data) return null;
  
  let matches = data.matches;
  
  
  if (options?.round) {
    matches = matches.filter(m => m.round === options.round);
  }
  
  if (options?.team) {
    const teamLower = options.team.toLowerCase();
    matches = matches.filter(m => 
      m.homeTeam.toLowerCase().includes(teamLower) ||
      m.awayTeam.toLowerCase().includes(teamLower)
    );
  }
  
  if (options?.dateFrom) {
    matches = matches.filter(m => new Date(m.date) >= new Date(options.dateFrom!));
  }
  
  if (options?.dateTo) {
    matches = matches.filter(m => new Date(m.date) <= new Date(options.dateTo!));
  }
  
  return {
    league: data.league,
    fixtures: matches.map(convertToFixture),
  };
}


export function getAllFixtures(options?: {
  league?: string;
  team?: string;
  round?: string;
  date?: string;
}): Array<{ league: string; country: string; fixture: FixtureResponse }> {
  const results: Array<{ league: string; country: string; fixture: FixtureResponse }> = [];
  
  const leagues = localData.listAvailableLeagues();
  
  for (const l of leagues) {
    const data = localData.loadLeagueData(l.filename);
    if (!data) continue;
    
    
    if (options?.league && !data.league.toLowerCase().includes(options.league.toLowerCase())) {
      continue;
    }
    
    for (const match of data.matches) {
      
      if (options?.team) {
        const teamLower = options.team.toLowerCase();
        if (!match.homeTeam.toLowerCase().includes(teamLower) &&
            !match.awayTeam.toLowerCase().includes(teamLower)) {
          continue;
        }
      }
      
      if (options?.round && match.round !== options.round) {
        continue;
      }
      
      if (options?.date) {
        const matchDate = new Date(match.date).toISOString().split('T')[0];
        if (matchDate !== options.date) continue;
      }
      
      results.push({
        league: data.league,
        country: l.country,
        fixture: convertToFixture(match),
      });
    }
  }
  
  return results;
}


export function getFixtureById(matchId: string): {
  fixture: FixtureResponse;
  league: string;
  country: string;
  stats: CollectedMatch['stats'];
} | null {
  const result = localData.findMatchById(matchId);
  if (!result) return null;
  
  return {
    fixture: convertToFixture(result.match),
    league: result.league.league,
    country: result.league.country,
    stats: result.match.stats,
  };
}






export function getTeams(leagueId?: string): TeamResponse[] {
  const teams = new Map<string, { name: string; country: string }>();
  
  const leagues = leagueId 
    ? [localData.loadLeagueData(`${leagueId}.json`) || localData.findLeagueBySlug(leagueId)].filter(Boolean)
    : localData.listAvailableLeagues().map(l => localData.loadLeagueData(l.filename)).filter(Boolean);
  
  for (const data of leagues) {
    if (!data || !data.matches || !Array.isArray(data.matches)) continue;
    
    for (const match of data.matches) {
      if (!teams.has(match.homeTeam)) {
        teams.set(match.homeTeam, { name: match.homeTeam, country: data.country });
      }
      if (!teams.has(match.awayTeam)) {
        teams.set(match.awayTeam, { name: match.awayTeam, country: data.country });
      }
    }
  }
  
  return Array.from(teams.values()).map(t => ({
    name: t.name,
    country: t.country,
  }));
}


export function getTeamFixtures(teamName: string): Array<{
  league: string;
  country: string;
  fixture: FixtureResponse;
}> {
  const results = localData.findMatchesByTeam(teamName);
  
  return results.map(r => ({
    league: r.league.league,
    country: r.league.country,
    fixture: convertToFixture(r.match),
  }));
}






export function getStandings(leagueId: string): {
  league: string;
  country: string;
  season: string;
  standings: Array<{
    position: number;
    team: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }>;
} | null {
  const data = localData.loadLeagueData(`${leagueId}.json`) ||
               localData.findLeagueBySlug(leagueId);
  
  if (!data) {
    
    const leagues = localData.listAvailableLeagues();
    const match = leagues.find(l => 
      l.filename.includes(leagueId) ||
      `${l.country}-${l.league}-${l.season}`.includes(leagueId)
    );
    if (!match) return null;
  }
  
  const filename = data 
    ? `${data.country}-${data.league.toLowerCase().replace(/\s+/g, '-')}-${data.season}.json`
    : localData.listAvailableLeagues().find(l => 
        l.filename.includes(leagueId) ||
        `${l.country}-${l.league}-${l.season}`.includes(leagueId)
      )?.filename;
  
  if (!filename) return null;
  
  const standings = localData.generateStandings(filename);
  
  return {
    league: data?.league || '',
    country: data?.country || '',
    season: data?.season || '',
    standings,
  };
}






export async function getMatchStats(matchId: string): Promise<StatsResponse | null> {
  
  if (USE_ONLINE_API) {
    try {
      const stats = await sportdb.getMatchStats(matchId);
      if (stats && stats.length > 0) {
        return {
          matchId,
          periods: stats,
        };
      }
    } catch (error) {
      
    }
  }
  
  
  const result = localData.findMatchById(matchId);
  if (!result) return null;
  
  
  const stats: Array<{ statId: string; statName: string; homeValue: string; awayValue: string }> = [];
  for (const [key, values] of Object.entries(result.match.stats)) {
    stats.push({
      statId: key.toLowerCase().replace(/\s+/g, '_'),
      statName: key,
      homeValue: values[0],
      awayValue: values[1],
    });
  }
  
  return {
    matchId,
    periods: [{
      period: 'Match',
      stats,
    }],
  };
}


export async function getMatchEvents(matchId: string): Promise<EventsResponse | null> {
  
  if (USE_ONLINE_API) {
    try {
      const events = await sportdb.getMatchEvents(matchId);
      if (events && events.length > 0) {
        return { matchId, events };
      }
    } catch (error) {
      
    }
  }

  
  const result = localData.findMatchById(matchId);
  if (result && result.match.events) {
    return {
      matchId,
      events: result.match.events,
    };
  }

  return null;
}


export async function getMatchLineups(matchId: string): Promise<LineupsResponse | null> {
  
  if (USE_ONLINE_API) {
    try {
      const lineups = await sportdb.getMatchLineups(matchId);
      if (lineups.home || lineups.away) {
        return {
          matchId,
          home: lineups.home,
          away: lineups.away,
        };
      }
    } catch (error) {
      
    }
  }
  
  
  const result = localData.findMatchById(matchId);
  if (result && result.match.lineups) {
    return {
      matchId,
      home: result.match.lineups.home,
      away: result.match.lineups.away,
    };
  }
  
  return null;
}







export function getLeagueStats(leagueId: string): {
  league: string;
  stats: {
    totalMatches: number;
    totalGoals: number;
    avgGoalsPerMatch: number;
    homeWins: number;
    awayWins: number;
    draws: number;
  };
} | null {
  const leagues = localData.listAvailableLeagues();
  const match = leagues.find(l => 
    l.filename === `${leagueId}.json` ||
    l.filename.includes(leagueId)
  );
  
  if (!match) return null;
  
  const data = localData.loadLeagueData(match.filename);
  const stats = localData.getLeagueStats(match.filename);
  
  if (!data || !stats) return null;
  
  return {
    league: data.league,
    stats,
  };
}
