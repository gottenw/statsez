import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import {
  getCountries,
  getCompetitions,
  getSeasons,
  getAllResults,
  getMatchStats,
  getMatchEvents,
  getMatchLineups,
} from './api.js';
import type { CollectedMatch, Country, Competition, LeagueData, Season, StatPeriod, MatchEvent, LineupTeam } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseStats(periods: StatPeriod[]): Record<string, [string, string]> {
  const stats: Record<string, [string, string]> = {};
  const matchPeriod = periods.find((p) => p?.period === 'Match') || periods.find((p) => p != null);
  if (!matchPeriod?.stats) return stats;

  const seen = new Set<string>();
  for (const s of matchPeriod.stats) {
    if (seen.has(s.statName)) continue;
    seen.add(s.statName);
    stats[s.statName] = [s.homeValue, s.awayValue];
  }
  return stats;
}

// ─── Pick from list ──────────────────────────────────────────────────────────

function printList<T>(items: T[], labelFn: (item: T) => string) {
  for (let i = 0; i < items.length; i++) {
    console.log(`  ${chalk.gray(`${i + 1}.`)} ${labelFn(items[i])}`);
  }
}

async function pickFromList<T>(items: T[], labelFn: (item: T) => string): Promise<T> {
  printList(items, labelFn);
  console.log();

  while (true) {
    const input = await ask(chalk.cyan('  > '));
    const num = parseInt(input.trim());
    if (num >= 1 && num <= items.length) {
      return items[num - 1];
    }
    console.log(chalk.red(`  Digite um numero de 1 a ${items.length}`));
  }
}

/**
 * Parse input like "1,3,5" or "1-5" or "1,3-5" into indices.
 */
function parseMultiSelection(input: string, max: number): number[] {
  const indices = new Set<number>();
  const parts = input.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= max && start <= end) {
        for (let i = start; i <= end; i++) indices.add(i);
      }
    } else {
      const num = parseInt(part);
      if (!isNaN(num) && num >= 1 && num <= max) {
        indices.add(num);
      }
    }
  }

  return [...indices].sort((a, b) => a - b);
}

async function pickMultipleFromList<T>(items: T[], labelFn: (item: T) => string): Promise<T[]> {
  printList(items, labelFn);
  console.log();
  console.log(chalk.gray('  Ex: 1,3,5 ou 1-5 ou 1,3-5'));

  while (true) {
    const input = await ask(chalk.cyan('  > '));
    const selected = parseMultiSelection(input, items.length);
    if (selected.length > 0) {
      return selected.map((i) => items[i - 1]);
    }
    console.log(chalk.red(`  Digite numeros de 1 a ${items.length} (ex: 1,3 ou 1-5)`));
  }
}

// ─── Collection ──────────────────────────────────────────────────────────────

async function collect(
  country: string,
  league: string,
  season: string,
  countrySlug: string,
  leagueSlug: string,
  leagueName: string,
) {
  const outFile = path.join(ROOT_DIR, `${countrySlug}-${leagueSlug}-${season}.json`);

  if (fs.existsSync(outFile)) {
    console.log(chalk.yellow(`\n  Arquivo ja existe: ${path.basename(outFile)}`));
    const resp = await ask(chalk.cyan('  Re-coletar? (s/n) > '));
    if (resp.trim().toLowerCase() !== 's') {
      console.log();
      return;
    }
  }

  console.log(chalk.bold(`\n  Coletando: ${leagueName} ${season}\n`));

  console.log(chalk.gray('  Buscando resultados...'));
  const results = await getAllResults(country, league, season, (page, count) => {
    console.log(chalk.gray(`    Pagina ${page}: ${count} jogos`));
  });

  if (results.length === 0) {
    console.log(chalk.red('  Nenhum resultado encontrado.\n'));
    return;
  }

  console.log(chalk.green(`  ${results.length} jogos encontrados\n`));

  const matches: CollectedMatch[] = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const label = `${r.homeName} ${r.homeFullTimeScore}-${r.awayFullTimeScore} ${r.awayName}`;
    process.stdout.write(
      `  ${chalk.gray(`[${i + 1}/${results.length}]`)} ${label}...`
    );

    const statsRaw = await getMatchStats(r.eventId);
    const stats = parseStats(statsRaw);
    
    // Novas coletas (Eventos e Escalações)
    const events = await getMatchEvents(r.eventId);
    const lineups = await getMatchLineups(r.eventId);

    matches.push({
      id: r.eventId,
      date: r.startDateTimeUtc,
      round: r.round,
      homeTeam: r.homeName,
      awayTeam: r.awayName,
      homeScore: parseInt(r.homeFullTimeScore) || 0,
      awayScore: parseInt(r.awayFullTimeScore) || 0,
      htHome: parseInt(r.homeScore) - parseInt(r.homeResultPeriod2 || '0') || 0,
      htAway: parseInt(r.awayScore) - parseInt(r.awayResultPeriod2 || '0') || 0,
      status: r.eventStage,
      stats,
      events,
      lineups,
    });

    const statCount = Object.keys(stats).length;
    console.log(
      `${statCount > 0 ? chalk.green(` ${statCount} stats`) : chalk.yellow(' sem stats')},` +
      `${events.length > 0 ? chalk.green(` ${events.length} events`) : chalk.yellow(' sem events')},` +
      `${lineups.home || lineups.away ? chalk.green(' lineups OK') : chalk.yellow(' sem lineups')}`
    );

    await sleep(300);
  }

  const data: LeagueData = {
    league: leagueName,
    country: countrySlug,
    season,
    collectedAt: new Date().toISOString(),
    totalMatches: matches.length,
    matches,
  };

  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log(chalk.bold.green(`\n  Salvo: ${path.basename(outFile)}`));
  console.log(chalk.gray(`  ${matches.length} jogos coletados\n`));
}

// ─── Interactive menu ────────────────────────────────────────────────────────

async function main() {
  console.log(chalk.bold('\n  Flashscore Collector\n'));

  // 1. Pick country
  console.log(chalk.gray('  Carregando paises...'));
  const countries = await getCountries();
  console.log(chalk.bold(`\n  Escolha o pais (${countries.length}):\n`));
  const country = await pickFromList(countries, (c) => c.name);
  const countryKey = `${country.slug}:${country.id}`;

  // 2. Pick leagues (multiple)
  console.log(chalk.gray('\n  Carregando competicoes...'));
  const competitions = await getCompetitions(countryKey);
  if (competitions.length === 0) {
    console.log(chalk.red('  Nenhuma competicao encontrada.\n'));
    rl.close();
    return;
  }
  console.log(chalk.bold(`\n  Escolha as competicoes (${competitions.length}):\n`));
  const selectedComps = await pickMultipleFromList(competitions, (c) => c.name);
  console.log(chalk.green(`\n  ${selectedComps.length} competicao(oes) selecionada(s)\n`));

  // 3. Pick season once (from the first selected league)
  const firstComp = selectedComps[0];
  const firstLeagueKey = `${firstComp.slug}:${firstComp.id}`;
  console.log(chalk.gray('  Carregando temporadas...'));
  const firstInfo = await getSeasons(countryKey, firstLeagueKey);
  const seasonsWithResults = firstInfo.seasons.filter((s) => s.results);
  if (seasonsWithResults.length === 0) {
    console.log(chalk.red('  Nenhuma temporada com resultados.\n'));
    rl.close();
    return;
  }
  console.log(chalk.bold(`\n  Escolha a temporada (${seasonsWithResults.length}):\n`));
  const season = await pickFromList(seasonsWithResults, (s) => s.season);

  // 4. Collect all selected leagues with the same season
  for (const comp of selectedComps) {
    const leagueKey = `${comp.slug}:${comp.id}`;
    console.log(chalk.bold(`\n  ── ${comp.name} ──`));

    const info = comp === firstComp ? firstInfo : await getSeasons(countryKey, leagueKey);

    await collect(
      countryKey,
      leagueKey,
      season.season,
      country.slug,
      comp.slug,
      info.name,
    );
  }

  rl.close();
}

main().catch((err) => {
  console.error(chalk.red(`\n  Erro: ${err.message}\n`));
  rl.close();
  process.exit(1);
});
