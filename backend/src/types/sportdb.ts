

export interface Country {
  name: string;
  id: number;
  slug: string;
}

export interface Competition {
  id: string;
  name: string;
  slug: string;
}

export interface Season {
  season: string;
  results?: string;
  fixtures?: string;
  standings?: string;
}

export interface LeagueInfo {
  id: string;
  slug: string;
  name: string;
  seasons: Season[];
}

export interface MatchResult {
  eventId: string;
  homeName: string;
  awayName: string;
  homeFullTimeScore: string;
  awayFullTimeScore: string;
  homeResultPeriod2: string;
  awayResultPeriod2: string;
  homeScore: string;
  awayScore: string;
  startDateTimeUtc: string;
  eventStage: string;
  round: string;
  home3CharName: string;
  away3CharName: string;
  homeParticipantNameUrl: string;
  awayParticipantNameUrl: string;
  links: {
    details: string;
    lineups: string;
    stats: string;
  };
}

export interface StatEntry {
  statId: string;
  statName: string;
  homeValue: string;
  awayValue: string;
}

export interface StatPeriod {
  period: string;
  stats: StatEntry[];
}

export interface LineupPlayer {
  participantId: string;
  participantName: string;
  participantSurname: string;
  participantNumber: string;
  participantRating?: string;
  participantCountry?: string;
  participantUrl?: string;
  formation?: string;
  playerType: string;
  positionId?: string;
  positionKey?: string;
}

export interface LineupTeam {
  formation: string;
  players: LineupPlayer[];
}

export interface MatchEvent {
  minute: string;
  order: number;
  event: string;
  label: string;
  is_home: boolean;
  is_away: boolean;
  player: {
    id: string | null;
    name: string | null;
  };
  info: {
    id: string | null;
    name: string | null;
  } | null;
}

export interface StandingsEntry {
  rank: string;
  teamId: string;
  teamName: string;
  teamSlug: string;
  points: string;
  matches: string;
  wins: string;
  winsRegular: string;
  draws: string;
  lossesRegular: string;
  goals: string;
  goalDiff: string;
  rankClass?: string;
  rankColor?: string;
  teamUrl?: string;
}

export interface CollectedMatch {
  id: string;
  date: string;
  round: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  htHome: number;
  htAway: number;
  status: string;
  stats: Record<string, [string, string]>;
  events?: MatchEvent[];
  lineups?: {
    home: LineupTeam | null;
    away: LineupTeam | null;
  };
}

export interface LeagueData {
  league: string;
  country: string;
  season: string;
  collectedAt: string;
  totalMatches: number;
  matches: CollectedMatch[];
}





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
    fullTime: {
      home: number;
      away: number;
    };
    halfTime: {
      home: number;
      away: number;
    };
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
  periods: StatPeriod[];
}

export interface EventsResponse {
  matchId: string;
  events: MatchEvent[];
}

export interface LineupsResponse {
  matchId: string;
  home: {
    formation: string;
    players: LineupPlayer[];
  } | null;
  away: {
    formation: string;
    players: LineupPlayer[];
  } | null;
}
