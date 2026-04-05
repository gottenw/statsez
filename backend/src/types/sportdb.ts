/**
 * Types for the RapidAPI Flashscore4 API responses.
 */

// ============================================
// GENERAL
// ============================================

export interface Country {
  country_id: number;
  country_url: string;
  name: string;
}

export interface Competition {
  tournament_url: string;
  name: string;
}

// ============================================
// TOURNAMENTS
// ============================================

export interface TournamentDetails {
  tournament_id: string;
  tournament_stage_id: string;
  name: string;
  image_path: string;
  country: {
    name: string;
    image_path: string;
    small_image_path: string;
  };
  start_year: string;
  end_year: string;
  is_current: boolean;
  stage_start_date_timestamp: number;
  stage_end_date_timestamp: number;
  winner?: {
    team_id: string;
    name: string;
    image_path: string;
  };
}

export interface TournamentFixture {
  match_id: string;
  timestamp: number;
  home_team: {
    team_id: string;
    name: string;
    short_name: string | null;
    small_image_path: string;
  };
  away_team: {
    team_id: string;
    name: string;
    short_name: string | null;
    small_image_path: string;
  };
  scores?: {
    home: number;
    away: number;
  };
  match_status?: {
    is_finished: boolean;
    stage: string;
  };
}

// ============================================
// MATCHES
// ============================================

export interface MatchDetail {
  match_id: string;
  match_status: {
    stage: string;
    is_cancelled: boolean;
    is_postponed: boolean;
    is_started: boolean;
    is_in_progress: boolean;
    is_finished: boolean;
    is_finished_after_extra_time: boolean;
    is_finished_after_penalties: boolean;
    live_time: string | null;
    winner: string | null;
    final_winner: string | null;
  };
  timestamp: number;
  sport: { sport_id: number; sport_url: string; name: string };
  country: { country_id: number; name: string };
  tournament: {
    tournament_id: string;
    tournament_stage_id: string;
    tournament_url: string;
    name: string;
  };
  referee: string;
  venue: {
    name: string;
    city: string;
    attendance: string;
    capacity: string;
  };
  home_team: {
    team_id: string;
    event_participant_id: string;
    team_url: string;
    name: string;
    short_name: string;
    image_path: string;
    small_image_path: string;
  };
  away_team: {
    team_id: string;
    event_participant_id: string;
    team_url: string;
    name: string;
    short_name: string;
    image_path: string;
    small_image_path: string;
  };
  scores: {
    home: number;
    away: number;
    home_total: number;
    away_total: number;
    home_1st_half: number;
    away_1st_half: number;
    home_2nd_half: number;
    away_2nd_half: number;
    home_extra_time: number | null;
    away_extra_time: number | null;
    home_penalties: number | null;
    away_penalties: number | null;
  };
}

export interface MatchStatEntry {
  name: string;
  home_team: string | number;
  away_team: string | number;
}

export interface MatchSummaryEvent {
  minutes: string;
  team: string;
  description: string;
  players: Array<{
    name: string;
    player_id: string;
    player_url: string;
    type: string;
    sub_type?: string;
  }>;
}

// ============================================
// LINEUPS
// ============================================

export interface LineupPlayer {
  name: string;
  fieldName: string;
  number: string;
  player_id: string;
  image_path: string | null;
  country_name: string;
  country_image_path: string;
  gender?: string;
}

export interface LineupSide {
  side: 'home' | 'away';
  predictedFormation: string | null;
  predictedLineups: LineupPlayer[];
  formation: string | null;
  startingLineups: LineupPlayer[];
  substitutes: LineupPlayer[];
  missingPlayers: LineupPlayer[];
}

// ============================================
// STANDINGS
// ============================================

export interface StandingsEntry {
  team_id: string;
  team_url: string;
  name: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: string; // "102:39"
  goal_difference: number;
  points: number;
}

// ============================================
// OUTPUT TYPES (used by footballData.ts → routes)
// ============================================

export interface FixtureResponse {
  id: string;
  date: string;
  round: string;
  homeTeam: {
    name: string;
    shortName?: string;
  };
  awayTeam: {
    name: string;
    shortName?: string;
  };
  score: {
    fullTime: { home: number; away: number };
    halfTime: { home: number; away: number };
  };
  status: string;
}

export interface LeagueResponse {
  id: string;
  name: string;
  country: string;
  season: string;
  slug: string;
}

export interface TeamResponse {
  name: string;
  shortName?: string;
  country: string;
}

export interface StatsResponse {
  matchId: string;
  stats: Array<{
    name: string;
    home: string | number;
    away: string | number;
  }>;
}

export interface EventsResponse {
  matchId: string;
  events: MatchSummaryEvent[];
}

export interface CleanPlayer {
  name: string;
  number: string;
  playerId: string;
  country: string;
}

export interface LineupsResponse {
  matchId: string;
  home: {
    formation: string;
    starting: CleanPlayer[];
    substitutes: CleanPlayer[];
  } | null;
  away: {
    formation: string;
    starting: CleanPlayer[];
    substitutes: CleanPlayer[];
  } | null;
}
