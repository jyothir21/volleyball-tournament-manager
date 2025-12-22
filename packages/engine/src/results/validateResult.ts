import type { MatchResult, SetScore, TeamId } from "../models.js";

/**
 * Validate set scores and derive the winner.
 * Throws an error if invalid.
 */
export function validateAndCreateMatchResult(
  teamAId: TeamId,
  teamBId: TeamId,
  sets: SetScore[]
): MatchResult {
  if (sets.length === 0) {
    throw new Error("Match must contain at least one set");
  }

  let teamAWins = 0;
  let teamBWins = 0;

  for (const set of sets) {
    if (set.teamA === set.teamB) {
      throw new Error("Set scores cannot be tied");
    }

    if (set.teamA > set.teamB) {
      teamAWins++;
    } else {
      teamBWins++;
    }
  }

  if (teamAWins === teamBWins) {
    throw new Error("Match cannot end in a tie");
  }

  const winnerTeamId = teamAWins > teamBWins ? teamAId : teamBId;

  return {
    sets,
    winnerTeamId,
  };
}
