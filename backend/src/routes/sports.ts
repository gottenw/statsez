import { Hono } from 'hono';
import { getCache, setCache } from '../services/cache.js';
import * as footballData from '../services/footballData.js';
import type { Sport } from '../types/index.js';

const app = new Hono();




const TTL_PERMANENT = 315360000; 
const TTL_DAILY = 86400;         
const TTL_HOUR = 3600;           





function validateSport(sport: string): sport is Sport {
  return ['football', 'basketball', 'tennis', 'hockey'].includes(sport);
}





app.get('/:sport/leagues', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const { country } = c.req.query();

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  
  if (sport !== 'football') {
    return c.json({
      success: true,
      data: { leagues: [], message: 'Esporte em implementação' },
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const params = { country };
  const ttl = TTL_DAILY;

  
  const cached = await getCache(sport, 'leagues', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  
  let leagues;
  if (country) {
    leagues = await footballData.getLeaguesByCountry(country);
  } else {
    leagues = await footballData.getLeagues();
  }

  const result = {
    leagues,
    total: leagues.length,
    filters: { country }
  };

  
  await setCache({ sport, endpoint: 'leagues', params, ttlSeconds: ttl }, result);

  return c.json({
    success: true,
    data: result,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/fixtures', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const { date, league, team, round, dateFrom, dateTo, season } = c.req.query();

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: { fixtures: [], message: 'Esporte em implementação' },
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  if (!league) {
    return c.json({ success: false, error: 'Parâmetro "league" é obrigatório para listar partidas' }, 400);
  }

  const params = { date, league, team, round, dateFrom, dateTo, season };
  const ttl = parseInt(process.env.CACHE_TTL_FIXTURES || '3600');


  const cached = await getCache(sport, 'fixtures', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }


  let result;
  if (league) {
    const fixtures = await footballData.getFixturesByLeague(league, { round, team, dateFrom, dateTo, season });
    result = fixtures || { fixtures: [], message: 'Liga não encontrada' };
  } else {
    const fixtures = await footballData.getAllFixtures({ team, round, date });
    result = {
      fixtures: fixtures.map(f => ({
        ...f.fixture,
        league: f.league,
        country: f.country,
      })),
      total: fixtures.length,
      filters: { team, round, date }
    };
  }

  
  await setCache({ sport, endpoint: 'fixtures', params, ttlSeconds: ttl }, result);

  return c.json({
    success: true,
    data: result,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/fixtures/:fixtureId', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const fixtureId = c.req.param('fixtureId');

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: null,
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const params = { fixtureId };
  const ttl = TTL_PERMANENT;

  
  const cached = await getCache(sport, 'fixture-details', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  
  const fixture = await footballData.getFixtureById(fixtureId);

  if (!fixture) {
    return c.json({
      success: false,
      error: 'Jogo não encontrado'
    }, 404);
  }

  const result = {
    fixture: fixture.fixture,
    league: fixture.league,
    country: fixture.country,
    stats: fixture.stats,
  };

  
  await setCache({ sport, endpoint: 'fixture-details', params, ttlSeconds: ttl }, result);

  return c.json({
    success: true,
    data: result,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/standings', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const { league, season } = c.req.query();

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: { standings: [], message: 'Esporte em implementação' },
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  if (!league) {
    return c.json({
      success: false,
      error: 'Parâmetro "league" é obrigatório'
    }, 400);
  }

  const params = { league, season };
  const ttl = TTL_DAILY;


  const cached = await getCache(sport, 'standings', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  
  const standings = await footballData.getStandings(league, season);

  if (!standings) {
    return c.json({
      success: false,
      error: 'Liga não encontrada'
    }, 404);
  }

  const result = {
    league: standings.league,
    country: standings.country,
    season: standings.season,
    standings: standings.standings,
    totalTeams: standings.standings.length,
  };

  
  await setCache({ sport, endpoint: 'standings', params, ttlSeconds: ttl }, result);

  return c.json({
    success: true,
    data: result,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/teams', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const { league, search, season } = c.req.query();

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: { teams: [], message: 'Esporte em implementação' },
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  if (!league) {
    return c.json({
      success: false,
      error: 'Parâmetro "league" é obrigatório para listar times'
    }, 400);
  }

  const params = { league, search, season };
  const ttl = parseInt(process.env.CACHE_TTL_STATISTICS || '86400');


  const cached = await getCache(sport, 'teams', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }


  let teams = await footballData.getTeams(league, season);

  
  if (search) {
    const searchLower = search.toLowerCase();
    teams = teams.filter(t => t.name.toLowerCase().includes(searchLower));
  }

  const result = {
    teams,
    total: teams.length,
    filters: { league, search }
  };

  
  await setCache({ sport, endpoint: 'teams', params, ttlSeconds: ttl }, result);

  return c.json({
    success: true,
    data: result,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/teams/:teamName/fixtures', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const teamName = c.req.param('teamName');
  const { league, season } = c.req.query();

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: { fixtures: [], message: 'Esporte em implementação' },
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  if (!league) {
    return c.json({
      success: false,
      error: 'Parâmetro "league" é obrigatório para buscar fixtures de um time'
    }, 400);
  }

  const params = { teamName, league, season };
  const ttl = parseInt(process.env.CACHE_TTL_FIXTURES || '3600');


  const cached = await getCache(sport, 'team-fixtures', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }


  const fixtures = await footballData.getTeamFixtures(teamName, league, season);

  const result = {
    team: teamName,
    league,
    fixtures: fixtures.map(f => ({
      ...f.fixture,
      league: f.league,
      country: f.country,
    })),
    total: fixtures.length,
  };


  await setCache({ sport, endpoint: 'team-fixtures', params, ttlSeconds: ttl }, result);

  return c.json({
    success: true,
    data: result,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/fixtures/:fixtureId/stats', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const fixtureId = c.req.param('fixtureId');

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: null,
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const params = { fixtureId };
  const ttl = TTL_PERMANENT;

  
  const cached = await getCache(sport, 'fixture-stats', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  
  const stats = await footballData.getMatchStats(fixtureId);

  if (!stats) {
    return c.json({
      success: false,
      error: 'Estatísticas não encontradas para este jogo'
    }, 404);
  }

  
  await setCache({ sport, endpoint: 'fixture-stats', params, ttlSeconds: ttl }, stats);

  return c.json({
    success: true,
    data: stats,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/fixtures/:fixtureId/lineups', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const fixtureId = c.req.param('fixtureId');

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: null,
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const params = { fixtureId };
  const ttl = TTL_PERMANENT;

  
  const cached = await getCache(sport, 'fixture-lineups', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  
  const lineups = await footballData.getMatchLineups(fixtureId);

  if (!lineups) {
    return c.json({
      success: false,
      error: 'Escalações não encontradas para este jogo'
    }, 404);
  }

  
  await setCache({ sport, endpoint: 'fixture-lineups', params, ttlSeconds: ttl }, lineups);

  return c.json({
    success: true,
    data: lineups,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});





app.get('/:sport/fixtures/:fixtureId/events', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const fixtureId = c.req.param('fixtureId');

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: null,
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const params = { fixtureId };
  const ttl = TTL_PERMANENT;

  
  const cached = await getCache(sport, 'fixture-events', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  
  const events = await footballData.getMatchEvents(fixtureId);

  if (!events) {
    return c.json({
      success: false,
      error: 'Eventos não encontrados para este jogo'
    }, 404);
  }

  
  await setCache({ sport, endpoint: 'fixture-events', params, ttlSeconds: ttl }, events);

  return c.json({
    success: true,
    data: events,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});






app.get('/:sport/leagues/:leagueId/seasons', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const leagueId = c.req.param('leagueId');

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: { seasons: [], message: 'Esporte em implementação' },
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const params = { leagueId };
  const ttl = TTL_DAILY;

  const cached = await getCache(sport, 'league-seasons', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const result = await footballData.getLeagueSeasons(leagueId);

  if (!result) {
    return c.json({
      success: false,
      error: 'Liga não encontrada'
    }, 404);
  }

  await setCache({ sport, endpoint: 'league-seasons', params, ttlSeconds: ttl }, result);

  return c.json({
    success: true,
    data: result,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});



app.get('/:sport/leagues/:leagueId/stats', async (c) => {
  const sport = c.req.param('sport') as Sport;
  const leagueId = c.req.param('leagueId');
  const { season } = c.req.query();

  if (!validateSport(sport)) {
    return c.json({ success: false, error: 'Esporte não suportado' }, 400);
  }

  if (sport !== 'football') {
    return c.json({
      success: true,
      data: null,
      meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
    });
  }

  const params = { leagueId, season };
  const ttl = parseInt(process.env.CACHE_TTL_STATISTICS || '7200');


  const cached = await getCache(sport, 'league-stats', params);
  if (cached) {
    c.set('cached', true);
    return c.json({
      success: true,
      data: cached,
      meta: { cached: true, remainingQuota: c.get('auth').remainingQuota }
    });
  }


  const stats = await footballData.getLeagueStats(leagueId, season);

  if (!stats) {
    return c.json({
      success: false,
      error: 'Liga não encontrada'
    }, 404);
  }

  
  await setCache({ sport, endpoint: 'league-stats', params, ttlSeconds: ttl }, stats);

  return c.json({
    success: true,
    data: stats,
    meta: { cached: false, remainingQuota: c.get('auth').remainingQuota }
  });
});

export const sportRoutes = app;
