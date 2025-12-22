// packages/engine/src/models.ts

export type TeamId = string;
export type MatchId = string;
export type CourtId = string;

/**
 * A team participating in the tournament
 */
export interface Team {
  id: TeamId;
  name: string;
}

/**
 * One set within a volleyball match
 */
export interface SetScore {
  teamA: number;
  teamB: number;
}

/**
 * Final result of a match
 */
export interface MatchResult {
  sets: SetScore[];
  winnerTeamId: TeamId;
}

/**
 * A scheduled or completed match
 */
export interface Match {
  id: MatchId;
  teamAId: TeamId;
  teamBId: TeamId;
  courtId?: CourtId;
  result?: MatchResult;
}

/**
 * Standings row for a team
 */
export interface StandingsRow {
  teamId: TeamId;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsFor: number;
  pointsAgainst: number;
}

/**
 * Tournament root object
 */
export interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}
