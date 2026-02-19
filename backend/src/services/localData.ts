

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { LeagueData, CollectedMatch } from '../types/sportdb.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLASHSCORE_DIR = path.resolve(__dirname, '../../../flashscore');


const dataCache = new Map<string, LeagueData>();


export function listAvailableLeagues(): Array<{
  filename: string;
  country: string;
  league: string;
  season: string;
}> {
  try {
    const files = fs.readdirSync(FLASHSCORE_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('package'));
    
    return jsonFiles.map(filename => {
      
      const parts = filename.replace('.json', '').split('-');
      
      const seasonParts = parts.slice(-2);
      const season = seasonParts.join('-');
      
      const leagueParts = parts.slice(1, -2);
      const league = leagueParts.join('-');
      
      const country = parts[0];
      
      return {
        filename,
        country,
        league,
        season,
      };
    });
  } catch (error) {
    console.error('Erro ao listar ligas:', error);
    return [];
  }
}


export function loadLeagueData(filename: string): LeagueData | null {
  
  if (dataCache.has(filename)) {
    return dataCache.get(filename)!;
  }

  try {
    const filepath = path.join(FLASHSCORE_DIR, filename);
    
    if (!fs.existsSync(filepath)) {
      return null;
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const data: LeagueData = JSON.parse(content);
    
    
    dataCache.set(filename, data);
    
    return data;
  } catch (error) {
    console.error(`Erro ao carregar ${filename}:`, error);
    return null;
  }
}


export function findLeagueByCountryAndName(
  country: string,
  leagueName: string
): LeagueData | null {
  const leagues = listAvailableLeagues();
  
  const match = leagues.find(l => 
    l.country.toLowerCase() === country.toLowerCase() &&
    l.league.toLowerCase().includes(leagueName.toLowerCase())
  );
  
  if (match) {
    return loadLeagueData(match.filename);
  }
  
  return null;
}


export function findLeagueBySlug(slug: string): LeagueData | null {
  const leagues = listAvailableLeagues();
  const match = leagues.find(l => 
    `${l.country}-${l.league}-${l.season}`.toLowerCase() === slug.toLowerCase() ||
    l.filename.replace('.json', '').toLowerCase() === slug.toLowerCase()
  );
  
  if (match) {
    return loadLeagueData(match.filename);
  }
  
  return null;
}


export function listAvailableCountries(): string[] {
  const leagues = listAvailableLeagues();
  const countries = new Set(leagues.map(l => l.country));
  return Array.from(countries).sort();
}


export function listLeaguesByCountry(country: string): Array<{
  filename: string;
  league: string;
  season: string;
  name: string;
}> {
  const leagues = listAvailableLeagues();
  
  return leagues
    .filter(l => l.country.toLowerCase() === country.toLowerCase())
    .map(l => {
      const data = loadLeagueData(l.filename);
      return {
        filename: l.filename,
        league: l.league,
        season: l.season,
        name: data?.league || l.league,
      };
    });
}


export function findMatchesByTeam(teamName: string): Array<{
  league: LeagueData;
  match: CollectedMatch;
}> {
  const results: Array<{ league: LeagueData; match: CollectedMatch }> = [];
  const leagues = listAvailableLeagues();
  
  for (const leagueInfo of leagues) {
    const league = loadLeagueData(leagueInfo.filename);
    if (!league) continue;
    
    for (const match of league.matches) {
      if (
        match.homeTeam.toLowerCase().includes(teamName.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(teamName.toLowerCase())
      ) {
        results.push({ league, match });
      }
    }
  }
  
  return results;
}


export function findMatchesByRound(
  filename: string,
  round: string
): CollectedMatch[] {
  const league = loadLeagueData(filename);
  if (!league) return [];
  
  return league.matches.filter(m => m.round === round);
}


export function findMatchById(matchId: string): {
  league: LeagueData;
  match: CollectedMatch;
} | null {
  const leagues = listAvailableLeagues();
  
  for (const leagueInfo of leagues) {
    const league = loadLeagueData(leagueInfo.filename);
    if (!league) continue;
    
    const match = league.matches.find(m => m.id === matchId);
    if (match) {
      return { league, match };
    }
  }
  
  return null;
}


export function getLeagueStats(filename: string): {
  totalMatches: number;
  totalGoals: number;
  avgGoalsPerMatch: number;
  homeWins: number;
  awayWins: number;
  draws: number;
} | null {
  const league = loadLeagueData(filename);
  if (!league) return null;
  
  let totalGoals = 0;
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  
  for (const match of league.matches) {
    totalGoals += match.homeScore + match.awayScore;
    
    if (match.homeScore > match.awayScore) homeWins++;
    else if (match.awayScore > match.homeScore) awayWins++;
    else draws++;
  }
  
  return {
    totalMatches: league.totalMatches,
    totalGoals,
    avgGoalsPerMatch: totalGoals / league.totalMatches,
    homeWins,
    awayWins,
    draws,
  };
}


export function generateStandings(filename: string): Array<{
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
}> {
  const league = loadLeagueData(filename);
  if (!league) return [];
  
  const table = new Map<string, {
    team: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }>();
  
  for (const match of league.matches) {
    
    if (!table.has(match.homeTeam)) {
      table.set(match.homeTeam, {
        team: match.homeTeam,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0
      });
    }
    if (!table.has(match.awayTeam)) {
      table.set(match.awayTeam, {
        team: match.awayTeam,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0
      });
    }
    
    const home = table.get(match.homeTeam)!;
    const away = table.get(match.awayTeam)!;
    
    
    home.played++;
    away.played++;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;
    
    if (match.homeScore > match.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (match.awayScore > match.homeScore) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
    }
  }
  
  
  const standings = Array.from(table.values())
    .map(t => ({
      ...t,
      goalDifference: t.goalsFor - t.goalsAgainst
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    })
    .map((t, index) => ({ ...t, position: index + 1 }));
  
  return standings;
}
