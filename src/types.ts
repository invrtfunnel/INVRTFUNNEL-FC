export interface Team {
  name: string;
  shortName: string;
  primaryColor: string; // Tailind class color or Hex
  secondaryColor: string;
  badgeStyle: 'shield-cross' | 'shield-stripes' | 'shield-star' | 'shield-circle' | 'shield-diagonal';
}

export interface MatchStats {
  possession: number; // Home possession percentage
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  foulsHome: number;
  foulsAway: number;
  cornersHome: number;
  cornersAway: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'card-yellow' | 'card-red' | 'substitution' | 'chance';
  team: 'home' | 'away';
  player: string;
  description: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'live' | 'upcoming' | 'finished';
  competition: string;
  matchDate?: string;
  matchTime?: string;
  stats: MatchStats;
  timeline: MatchEvent[];
  homeLineup: string[];
  awayLineup: string[];
}
