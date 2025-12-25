import type { Tournament, Match, Team, StandingsRow } from "../models.js";
import { MatchStatus } from "../models.js";
import { computeStandings, validateAndCreateMatchResult } from "../index.js";
import { generateSingleEliminationBracket } from "../playoffs/generateSingleElim.js";
import type { PlayoffBracket } from "../models.js";

export class TournamentState {
  private tournament: Tournament;
  private playoffBracket?: PlayoffBracket;

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

  generatePlayoffs(): PlayoffBracket {
    if (this.playoffBracket) {
      throw new Error("Playoffs already generated");
    }

    const standings = this.getStandings();
    this.playoffBracket = generateSingleEliminationBracket(standings);
    return this.playoffBracket;
  }

  getPlayoffs(): PlayoffBracket | undefined {
    return this.playoffBracket;
  }

  submitPlayoffMatchResult(matchId: string, sets: any[]): void {
    if (!this.playoffBracket) {
      throw new Error("Playoffs not generated");
    }

    for (let r = 0; r < this.playoffBracket.rounds.length; r++) {
      const round = this.playoffBracket.rounds[r];
      const match = round.matches.find((m) => m.id === matchId);

      if (!match) continue;

      if (match.status !== MatchStatus.Scheduled) {
        throw new Error("Match is not editable");
      }

      match.result = validateAndCreateMatchResult(
        match.teamAId,
        match.teamBId,
        sets
      );
      match.status = MatchStatus.Completed;

      const winner = match.result.winnerTeamId;

      // Advance winner
      if (match.winnerToMatchId) {
        const nextRound = this.playoffBracket.rounds[r + 1];
        const nextMatch = nextRound.matches.find(
          (m) => m.id === match.winnerToMatchId
        )!;

        if (!nextMatch.teamAId) {
          nextMatch.teamAId = winner;
        } else {
          nextMatch.teamBId = winner;
        }
      }

      return;
    }

    throw new Error("Playoff match not found");
  }
}
