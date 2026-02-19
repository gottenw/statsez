import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLASH_DIR = path.resolve(__dirname, '..');
const DATA_LEAGUES_DIR = path.resolve(__dirname, '..', '..', 'data', 'leagues');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FlashMatch {
  homeTeam: string;
  awayTeam: string;
  [key: string]: unknown;
}

interface FlashFile {
  league: string;
  country: string;
  season: string;
  collectedAt?: string;
  totalMatches: number;
  matches: FlashMatch[];
}

interface DataMatch {
  homeName: string;
  awayName: string;
  [key: string]: unknown;
}

interface DataFile {
  leagueName?: string;
  lastUpdated?: string;
  matches: DataMatch[];
}

interface TeamMapping {
  flashName: string;
  dataName: string;
  method: 'exact' | 'normalized' | 'substring' | 'levenshtein';
}

interface FileMapping {
  flashFile: string;
  dataFile: string;
  overlap: number;
  totalFlashTeams: number;
  totalDataTeams: number;
}

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const applyMode = args.includes('--apply');
const verbose = args.includes('--verbose') || args.includes('-v');

// ---------------------------------------------------------------------------
// Utility: Levenshtein distance
// ---------------------------------------------------------------------------
function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[la][lb];
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

/** Common prefixes/suffixes that bookmakers add or flashscore strips */
const STRIP_PREFIXES = [
  'CD', 'SD', 'UD', 'UE', 'FC', 'CF', 'CA', 'UP', 'CE', 'RC',
  'RSD', 'AD', 'SC', 'AC', 'US', 'SS', 'AS', 'SU', 'ASD',
  'FK', 'KF', 'SK', 'NK', 'GNK', 'HNK', 'RNK', 'MFK', 'MSK',
  'KS', 'KP', 'KKS', 'MKS', 'GKS', 'WKS', 'LKS', 'FKS', 'OKS',
  'BSC', 'TSV', 'SV', 'VfB', 'VfL', 'VfR', 'FSV', 'SpVgg',
  'RSC', 'RFC', 'RWD', 'KV', 'KRC', 'KAA', 'KVC', 'KFCO',
  'IF', 'IFK', 'BK', 'FF', 'AIK',
  'OGC', 'RC', 'AJ', 'EA', 'SO',
  'PFC', 'OFC', 'MFC', 'CFC',
];

const STRIP_SUFFIXES = [
  'FC', 'CF', 'SC', 'AC', 'BC', 'EC',
  'FK', 'SK', 'BK',
  'SV', 'SE',
  'CF UDS',
];

/**
 * Known aliases: names that are genuinely different between flashscore
 * and data/leagues that no normalization or fuzzy logic can resolve.
 * Maps: flashscore normalized name -> data/leagues normalized name
 */
const KNOWN_ALIASES: Record<string, string> = {
  // England
  'manchester utd': 'man utd',
  'nottingham': 'nottm forest',
  'wolves': 'wolverhampton',
  // Netherlands reserves
  'jong ajax': 'ajax reserves',
  'jong psv': 'psv reserves',
  'jong az': 'az reserves',
  'jong utrecht': 'utrecht reserves',
  'venlo': 'vvv',
  'waalwijk': 'rkc',
  // Belgium
  'sporting lokeren': 'lokeren temse',
  'rwdm brussels': 'rwd molenbeek',
  'k lierse s k': 'lierse kempenzonen',
  'k lierse': 'lierse kempenzonen',
  'anderlecht u23': 'anderlecht ii',
  'royale union sg': 'union saint gilloise',
  // Morocco
  'maghreb fez': 'mas fes',
  'wydad': 'wydad casablanca',
  'olympique de safi': 'safi',
  // Germany
  'koln ii': 'koln ii',
  'munich 1860': '1860 munich',
  'lok sofia': 'lokomotiv 1929 sofia',
  // Slovakia
  'dun streda': 'dunajska streda',
  // Serbia
  'tsc': 'backa topola',
  // Portugal
  'sporting cp u23': 'sporting u23',
  'esperanca': 'esperanca d andorra',
  // Egypt
  'arab contractors': 'al moqawloon al arab',
  'al sekka': 'el seka el hadid',
  // Malaysia
  'penang': 'pulau pinang',
  'kelantan the real warriors': 'kelantan darul naim',
  'johor dt': 'johor darul takzim',
  // Spain
  'malaga b': 'atletico malagueno',
  'betis b': 'betis deportivo',
  'xerez d f c': 'xerez deportivo fc',
  'xerez dfc': 'xerez deportivo fc',
  'zacatecas mineros': 'mineros de zacatecas',
  // Poland
  'pruszkow': 'znicz pruszkow',
  'grodzisk m': 'pogon grodzisk mazowiecki',
  // Hungary
  'dvtk': 'diosgyori vtk',
  'gyor': 'gyori eto',
  // Romania
  'uta arad': 'uta batrana doamna',
  'u cluj': 'universitatea cluj',
  // Vietnam
  'phu dong ninh binh': 'ttbd phu dong',
  // Algeria
  'telaghema': 'teleghma',
  // Mexico
  'leones negros': 'leones negros',
  // Italy
  'arzignano': 'arzignanochiampo',
};

/** Abbreviation expansions (applied before stripping) */
const ABBREVIATIONS: [RegExp, string][] = [
  [/\bAtl\.\s*/g, 'Atletico '],
  [/\bDep\.\s*/g, 'Deportivo '],
  [/\bR\.\s*/g, 'Real '],
  [/\bInt\.\s*/g, 'Internacional '],
  [/\bEsp\.\s*/g, 'Esperance '],
];

/**
 * Normalize a team name for comparison:
 * - lowercase
 * - expand abbreviations
 * - strip common prefixes/suffixes
 * - remove dots, dashes, parentheses
 * - collapse whitespace
 */
function normalize(name: string): string {
  let n = name.trim();

  // Expand abbreviations
  for (const [pat, rep] of ABBREVIATIONS) {
    n = n.replace(pat, rep);
  }

  n = n.toLowerCase();

  // Remove accents (e.g. Pruszków -> pruszkow, Esperança -> esperanca)
  n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Remove dots (e.g. "L.R." -> "lr")
  n = n.replace(/\./g, ' ');

  // Remove dashes, parentheses, and apostrophes
  n = n.replace(/[-()''`]/g, ' ');

  // Strip known prefixes (only if followed by space)
  for (const prefix of STRIP_PREFIXES) {
    const re = new RegExp(`^${prefix.toLowerCase()}\\s+`, 'i');
    n = n.replace(re, '');
  }

  // Strip known suffixes (only if preceded by space)
  for (const suffix of STRIP_SUFFIXES) {
    const re = new RegExp(`\\s+${suffix.toLowerCase()}(\\s+uds)?$`, 'i');
    n = n.replace(re, '');
  }

  // Collapse whitespace
  n = n.replace(/\s+/g, ' ').trim();

  return n;
}

/**
 * Generate multiple "tokens" or key-words from a name for overlap matching.
 * Used when matching flashscore files to data/leagues files by team overlap.
 */
function tokenize(name: string): string[] {
  return normalize(name).split(/\s+/).filter(t => t.length > 1);
}

// ---------------------------------------------------------------------------
// Step 1: Extract unique team names from files
// ---------------------------------------------------------------------------

function getFlashTeams(data: FlashFile): Set<string> {
  const teams = new Set<string>();
  for (const m of data.matches) {
    if (m.homeTeam) teams.add(m.homeTeam);
    if (m.awayTeam) teams.add(m.awayTeam);
  }
  return teams;
}

function getDataTeams(data: DataFile): Set<string> {
  const teams = new Set<string>();
  for (const m of data.matches) {
    if (m.homeName) teams.add(m.homeName);
    if (m.awayName) teams.add(m.awayName);
  }
  return teams;
}

// ---------------------------------------------------------------------------
// Step 2: Build file mapping (flashscore <-> data/leagues) via team overlap
// ---------------------------------------------------------------------------

/**
 * Count how many flashscore teams can be matched (exact or normalized) against
 * data/leagues teams. Returns a count of matched teams.
 */
function countTeamOverlap(flashTeams: Set<string>, dataTeams: Set<string>): number {
  const dataNormMap = new Map<string, string>();
  for (const dt of dataTeams) {
    dataNormMap.set(normalize(dt), dt);
  }

  let count = 0;
  for (const ft of flashTeams) {
    // exact match
    if (dataTeams.has(ft)) {
      count++;
      continue;
    }
    // normalized match
    const nf = normalize(ft);
    if (dataNormMap.has(nf)) {
      count++;
      continue;
    }
    // substring/contains match on normalized forms (word-boundary aware)
    for (const [dnorm] of dataNormMap) {
      if (nf.length >= 4 && dnorm.length >= 4) {
        const shorter = nf.length <= dnorm.length ? nf : dnorm;
        const longer = nf.length <= dnorm.length ? dnorm : nf;
        const escaped = shorter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wbRegex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`);
        if (wbRegex.test(longer) || longer === shorter) {
          count++;
          break;
        }
      }
    }
  }
  return count;
}

function buildFileMapping(): FileMapping[] {
  const flashFiles = fs.readdirSync(FLASH_DIR)
    .filter(f => f.endsWith('.json') && f !== 'package.json' && f !== 'package-lock.json' && f !== 'tsconfig.json');

  const dataFiles = fs.readdirSync(DATA_LEAGUES_DIR)
    .filter(f => f.endsWith('.json'));

  // Pre-load all data/leagues files and their teams
  const dataCache = new Map<string, { data: DataFile; teams: Set<string> }>();
  for (const df of dataFiles) {
    try {
      const raw = fs.readFileSync(path.join(DATA_LEAGUES_DIR, df), 'utf-8');
      const data = JSON.parse(raw) as DataFile;
      const teams = getDataTeams(data);
      if (teams.size > 0) {
        dataCache.set(df, { data, teams });
      }
    } catch {
      // skip unreadable files
    }
  }

  const mappings: FileMapping[] = [];
  const usedDataFiles = new Set<string>();

  for (const ff of flashFiles) {
    let flashData: FlashFile;
    try {
      const raw = fs.readFileSync(path.join(FLASH_DIR, ff), 'utf-8');
      flashData = JSON.parse(raw) as FlashFile;
    } catch {
      continue;
    }

    const flashTeams = getFlashTeams(flashData);
    if (flashTeams.size === 0) continue;

    let bestMatch = '';
    let bestOverlap = 0;

    for (const [df, { teams: dataTeams }] of dataCache) {
      if (usedDataFiles.has(df)) continue;

      const overlap = countTeamOverlap(flashTeams, dataTeams);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestMatch = df;
      }
    }

    // Only accept a mapping if at least 3 teams overlap, or at least 30% of the smaller set
    const minThreshold = Math.max(3, Math.floor(Math.min(flashTeams.size, bestMatch ? dataCache.get(bestMatch)!.teams.size : 0) * 0.3));

    if (bestMatch && bestOverlap >= minThreshold) {
      usedDataFiles.add(bestMatch);
      mappings.push({
        flashFile: ff,
        dataFile: bestMatch,
        overlap: bestOverlap,
        totalFlashTeams: flashTeams.size,
        totalDataTeams: dataCache.get(bestMatch)!.teams.size,
      });
    } else {
      // No match found -- report it
      mappings.push({
        flashFile: ff,
        dataFile: '',
        overlap: bestOverlap,
        totalFlashTeams: flashTeams.size,
        totalDataTeams: 0,
      });
    }
  }

  return mappings;
}

// ---------------------------------------------------------------------------
// Step 3: Match individual team names between paired files
// ---------------------------------------------------------------------------

function matchTeams(flashTeams: Set<string>, dataTeams: Set<string>): {
  matched: TeamMapping[];
  unmatchedFlash: string[];
  unmatchedData: string[];
} {
  const matched: TeamMapping[] = [];
  const remainingData = new Set(dataTeams);
  const remainingFlash = new Set(flashTeams);

  // --- Pass 1: exact match ---
  for (const ft of [...remainingFlash]) {
    if (remainingData.has(ft)) {
      matched.push({ flashName: ft, dataName: ft, method: 'exact' });
      remainingFlash.delete(ft);
      remainingData.delete(ft);
    }
  }

  // --- Build normalized lookup for remaining data teams ---
  let dataNormMap = new Map<string, string>();
  for (const dt of remainingData) {
    dataNormMap.set(normalize(dt), dt);
  }

  // --- Pass 1.5: known aliases ---
  for (const ft of [...remainingFlash]) {
    const nf = normalize(ft);
    const alias = KNOWN_ALIASES[nf];
    if (!alias) continue;

    // Find a data team whose normalized form contains the alias (or exact)
    let bestMatch = '';
    for (const [dnorm, dOriginal] of dataNormMap) {
      if (!remainingData.has(dOriginal)) continue;
      if (dnorm === alias || dnorm.includes(alias) || alias.includes(dnorm)) {
        bestMatch = dOriginal;
        break;
      }
    }

    if (bestMatch) {
      matched.push({ flashName: ft, dataName: bestMatch, method: 'normalized' });
      remainingFlash.delete(ft);
      remainingData.delete(bestMatch);
      dataNormMap.delete(normalize(bestMatch));
    }
  }

  // Rebuild norm map after aliases pass
  dataNormMap = new Map<string, string>();
  for (const dt of remainingData) {
    dataNormMap.set(normalize(dt), dt);
  }

  // --- Pass 2: normalized match ---
  for (const ft of [...remainingFlash]) {
    const nf = normalize(ft);
    const match = dataNormMap.get(nf);
    if (match && remainingData.has(match)) {
      matched.push({ flashName: ft, dataName: match, method: 'normalized' });
      remainingFlash.delete(ft);
      remainingData.delete(match);
      dataNormMap.delete(nf);
    }
  }

  // Rebuild norm map after pass 2
  dataNormMap.clear();
  for (const dt of remainingData) {
    dataNormMap.set(normalize(dt), dt);
  }

  // --- Pass 3: substring/contains match (on normalized names) ---
  // Require that the substring match occurs at a word boundary to prevent
  // false positives like "aris" matching inside "larissa".
  for (const ft of [...remainingFlash]) {
    const nf = normalize(ft);
    if (nf.length < 3) continue;

    let bestCandidate = '';
    let bestScore = Infinity;

    for (const [dnorm, dOriginal] of dataNormMap) {
      if (!remainingData.has(dOriginal)) continue;
      if (dnorm.length < 3) continue;

      // Check word-boundary substring: the shorter string must appear as
      // a whole word (or sequence of whole words) within the longer one.
      const shorter = nf.length <= dnorm.length ? nf : dnorm;
      const longer = nf.length <= dnorm.length ? dnorm : nf;

      // Build a regex that matches the shorter string at word boundaries
      const escaped = shorter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`);

      if (wordBoundaryRegex.test(longer) || longer === shorter) {
        // Among multiple substring matches, pick the one with smallest length diff
        const diff = Math.abs(dnorm.length - nf.length);
        if (diff < bestScore) {
          bestScore = diff;
          bestCandidate = dOriginal;
        }
      }
    }

    if (bestCandidate) {
      matched.push({ flashName: ft, dataName: bestCandidate, method: 'substring' });
      remainingFlash.delete(ft);
      remainingData.delete(bestCandidate);
      dataNormMap.delete(normalize(bestCandidate));
    }
  }

  // Rebuild norm map after pass 3
  dataNormMap.clear();
  for (const dt of remainingData) {
    dataNormMap.set(normalize(dt), dt);
  }

  // --- Pass 4: Levenshtein fuzzy match (optimal greedy assignment) ---
  // Compute all pairwise scores, then greedily assign best global pairs
  // to avoid "crossed" matches (A->B' and B->A' swaps).
  {
    const candidates: { ft: string; dt: string; nf: string; dnorm: string; similarity: number; tokenOverlap: number }[] = [];

    for (const ft of remainingFlash) {
      const nf = normalize(ft);
      if (nf.length < 3) continue;
      const flashTokens = tokenize(ft);

      for (const [dnorm, dOriginal] of dataNormMap) {
        if (!remainingData.has(dOriginal)) continue;
        if (dnorm.length < 3) continue;

        const dist = levenshtein(nf, dnorm);
        const maxLen = Math.max(nf.length, dnorm.length);
        const similarity = 1 - dist / maxLen;

        const dataTokens = tokenize(dOriginal);
        const commonTokens = flashTokens.filter(t =>
          dataTokens.some(dt => dt === t || (dt.length >= 4 && t.length >= 4 && (dt.includes(t) || t.includes(dt))))
        );
        const tokenOverlap = commonTokens.length / Math.max(1, Math.min(flashTokens.length, dataTokens.length));

        // Pre-filter: require at least one token in common OR high similarity
        if (similarity >= 0.5 || tokenOverlap >= 0.5) {
          candidates.push({ ft, dt: dOriginal, nf, dnorm, similarity, tokenOverlap });
        }
      }
    }

    // Sort by combined score (similarity + token overlap bonus), descending
    candidates.sort((a, b) => {
      const scoreA = a.similarity + a.tokenOverlap * 0.3;
      const scoreB = b.similarity + b.tokenOverlap * 0.3;
      return scoreB - scoreA;
    });

    // Greedy assignment: pick best pairs first
    const usedFlash = new Set<string>();
    const usedData = new Set<string>();

    for (const c of candidates) {
      if (usedFlash.has(c.ft) || usedData.has(c.dt)) continue;

      // Accept if similarity >= 0.6 OR (similarity >= 0.45 AND tokenOverlap >= 0.5)
      if (c.similarity >= 0.6 || (c.similarity >= 0.45 && c.tokenOverlap >= 0.5)) {
        matched.push({ flashName: c.ft, dataName: c.dt, method: 'levenshtein' });
        usedFlash.add(c.ft);
        usedData.add(c.dt);
        remainingFlash.delete(c.ft);
        remainingData.delete(c.dt);
        dataNormMap.delete(c.dnorm);
      }
    }
  }

  return {
    matched,
    unmatchedFlash: [...remainingFlash].sort(),
    unmatchedData: [...remainingData].sort(),
  };
}

// ---------------------------------------------------------------------------
// Step 4: Apply renames
// ---------------------------------------------------------------------------

function applyRenames(flashFilePath: string, renameMap: Map<string, string>): { changed: number } {
  const raw = fs.readFileSync(flashFilePath, 'utf-8');
  const data = JSON.parse(raw) as FlashFile;
  let changed = 0;

  for (const match of data.matches) {
    if (renameMap.has(match.homeTeam)) {
      match.homeTeam = renameMap.get(match.homeTeam)!;
      changed++;
    }
    if (renameMap.has(match.awayTeam)) {
      match.awayTeam = renameMap.get(match.awayTeam)!;
      changed++;
    }
  }

  if (changed > 0) {
    fs.writeFileSync(flashFilePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  return { changed };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log(chalk.bold.cyan('\n========================================'));
  console.log(chalk.bold.cyan('  Flashscore Team Name Rename Tool'));
  console.log(chalk.bold.cyan('========================================\n'));
  console.log(chalk.gray(`Mode: ${applyMode ? chalk.red.bold('APPLY (will modify files)') : chalk.green.bold('DRY RUN (read-only)')}`));
  console.log(chalk.gray(`Flash dir:  ${FLASH_DIR}`));
  console.log(chalk.gray(`Data dir:   ${DATA_LEAGUES_DIR}\n`));

  // --- Step 1: Build file mapping ---
  console.log(chalk.bold.yellow('Step 1: Building file mapping via team overlap...\n'));
  const fileMappings = buildFileMapping();

  const matched = fileMappings.filter(m => m.dataFile !== '');
  const unmatched = fileMappings.filter(m => m.dataFile === '');

  console.log(chalk.green(`  Matched: ${matched.length} file pairs`));
  if (unmatched.length > 0) {
    console.log(chalk.red(`  Unmatched flashscore files: ${unmatched.length}`));
    for (const u of unmatched) {
      console.log(chalk.red(`    - ${u.flashFile} (${u.totalFlashTeams} teams, best overlap: ${u.overlap})`));
    }
  }
  console.log('');

  if (verbose) {
    console.log(chalk.gray('  File mapping details:'));
    for (const m of matched) {
      console.log(chalk.gray(`    ${m.flashFile}`));
      console.log(chalk.gray(`      -> ${m.dataFile} (overlap: ${m.overlap}/${Math.min(m.totalFlashTeams, m.totalDataTeams)})`));
    }
    console.log('');
  }

  // --- Step 2: Match teams within each file pair ---
  console.log(chalk.bold.yellow('Step 2: Matching team names within file pairs...\n'));

  let totalRenames = 0;
  let totalUnmatchedFlash = 0;
  let totalUnmatchedData = 0;
  let totalFieldChanges = 0;

  const allRenames: { flashFile: string; renameMap: Map<string, string>; result: ReturnType<typeof matchTeams> }[] = [];

  for (const fm of matched) {
    const flashPath = path.join(FLASH_DIR, fm.flashFile);
    const dataPath = path.join(DATA_LEAGUES_DIR, fm.dataFile);

    let flashData: FlashFile;
    let dataData: DataFile;
    try {
      flashData = JSON.parse(fs.readFileSync(flashPath, 'utf-8')) as FlashFile;
      dataData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as DataFile;
    } catch {
      console.log(chalk.red(`  Error reading files for ${fm.flashFile}, skipping.`));
      continue;
    }

    const flashTeams = getFlashTeams(flashData);
    const dataTeams = getDataTeams(dataData);
    const result = matchTeams(flashTeams, dataTeams);

    // Build rename map: flashscore name -> data/leagues name (only where they differ)
    const renameMap = new Map<string, string>();
    for (const m of result.matched) {
      if (m.flashName !== m.dataName) {
        renameMap.set(m.flashName, m.dataName);
      }
    }

    allRenames.push({ flashFile: fm.flashFile, renameMap, result });

    const renames = renameMap.size;
    totalRenames += renames;
    totalUnmatchedFlash += result.unmatchedFlash.length;
    totalUnmatchedData += result.unmatchedData.length;

    // Print per-file report
    const tag = fm.flashFile.replace(/\.json$/, '');
    if (renames > 0 || result.unmatchedFlash.length > 0 || result.unmatchedData.length > 0 || verbose) {
      console.log(chalk.bold.white(`  ${tag}`));
      console.log(chalk.gray(`    -> ${fm.dataFile.replace(/\.json$/, '')} (${result.matched.length} matched, ${result.unmatchedFlash.length} unmatched flash, ${result.unmatchedData.length} unmatched data)`));

      if (renames > 0) {
        console.log(chalk.cyan(`    Renames (${renames}):`));
        for (const [oldName, newName] of renameMap) {
          const mapping = result.matched.find(m => m.flashName === oldName)!;
          const methodColor = mapping.method === 'normalized' ? chalk.blue
            : mapping.method === 'substring' ? chalk.magenta
            : mapping.method === 'levenshtein' ? chalk.yellow
            : chalk.green;
          console.log(`      ${chalk.red(oldName)} -> ${chalk.green(newName)} ${methodColor(`[${mapping.method}]`)}`);
        }
      }

      if (result.unmatchedFlash.length > 0) {
        console.log(chalk.red(`    Unmatched flashscore teams (${result.unmatchedFlash.length}):`));
        for (const t of result.unmatchedFlash) {
          console.log(chalk.red(`      ? ${t}`));
        }
      }

      if (result.unmatchedData.length > 0) {
        console.log(chalk.yellow(`    Unmatched data/leagues teams (${result.unmatchedData.length}):`));
        for (const t of result.unmatchedData) {
          console.log(chalk.yellow(`      ? ${t}`));
        }
      }
      console.log('');
    }
  }

  // --- Step 3: Summary ---
  console.log(chalk.bold.yellow('Step 3: Summary\n'));
  console.log(chalk.white(`  File pairs matched:        ${matched.length}`));
  console.log(chalk.white(`  Files without match:       ${unmatched.length}`));
  console.log(chalk.white(`  Team renames identified:   ${totalRenames}`));
  console.log(chalk.white(`  Unmatched flash teams:     ${totalUnmatchedFlash}`));
  console.log(chalk.white(`  Unmatched data teams:      ${totalUnmatchedData}`));
  console.log('');

  // --- Step 4: Apply if requested ---
  if (applyMode) {
    console.log(chalk.bold.yellow('Step 4: Applying renames...\n'));

    for (const { flashFile, renameMap } of allRenames) {
      if (renameMap.size === 0) continue;

      const flashPath = path.join(FLASH_DIR, flashFile);
      const { changed } = applyRenames(flashPath, renameMap);
      totalFieldChanges += changed;
      console.log(chalk.green(`  ${flashFile}: ${changed} field(s) updated (${renameMap.size} team names)`));
    }

    console.log(chalk.bold.green(`\n  Total fields updated: ${totalFieldChanges}`));
    console.log(chalk.bold.green('  Done! Files have been modified.\n'));
  } else {
    console.log(chalk.gray('  Dry run complete. Use --apply to modify files.'));
    console.log(chalk.gray('  Use --verbose for detailed file mapping info.\n'));
  }
}

main();
