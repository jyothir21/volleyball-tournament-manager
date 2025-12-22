import type { Tournament, Match, Team, StandingsRow } from "../models.js";
import { MatchStatus } from "../models.js";
import { computeStandings, validateAndCreateMatchResult } from "../index.js";

export class TournamentState {
  private tournament: Tournament;

  constructor(tournament: Tournament) {
    this.tournament = tournament;
  }

  getTournament(): Tournament {
    return this.tournament;
  }

  getMatches(): Match[] {
    return this.tournament.matches;
  }

  getStandings(): StandingsRow[] {
    return computeStandings(this.tournament.teams, this.tournament.matches);
  }

  submitMatchResult(matchId: string, sets: any[]): void {
    const match = this.tournament.matches.find((m) => m.id === matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.status !== MatchStatus.Scheduled) {
      throw new Error("Match is not editable");
    }

    match.result = validateAndCreateMatchResult(
      match.teamAId,
      match.teamBId,
      sets
    );

    match.status = MatchStatus.Completed;
  }

  lockMatch(matchId: string): void {
    const match = this.tournament.matches.find((m) => m.id === matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.status !== MatchStatus.Completed) {
      throw new Error("Only completed matches can be locked");
    }

    match.status = MatchStatus.Locked;
  }
}
