import type { Match, MatchResult, StandingsRow, Team } from "../models.js";

/**
 * Compute tournament standings from completed matches
 */
export function computeStandings(
  teams: Team[],
  matches: Match[]
): StandingsRow[] {
  const table = new Map<string, StandingsRow>();

  // Initialize standings
  for (const team of teams) {
    table.set(team.id, {
      teamId: team.id,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    });
  }

  for (const match of matches) {
    if (!match.result) continue;

    applyMatchResult(table, match);
  }

  return Array.from(table.values()).sort(compareStandings);
}

function applyMatchResult(table: Map<string, StandingsRow>, match: Match) {
  const result = match.result!;
  const rowA = table.get(match.teamAId)!;
  const rowB = table.get(match.teamBId)!;

  for (const set of result.sets) {
    rowA.pointsFor += set.teamA;
    rowA.pointsAgainst += set.teamB;

    rowB.pointsFor += set.teamB;
    rowB.pointsAgainst += set.teamA;

    if (set.teamA > set.teamB) {
      rowA.setsWon++;
      rowB.setsLost++;
    } else {
      rowB.setsWon++;
      rowA.setsLost++;
    }
  }

  if (result.winnerTeamId === match.teamAId) {
    rowA.wins++;
    rowB.losses++;
  } else {
    rowB.wins++;
    rowA.losses++;
  }
}

function compareStandings(a: StandingsRow, b: StandingsRow): number {
  // 1. Wins
  if (b.wins !== a.wins) {
    return b.wins - a.wins;
  }

  // 2. Set differential
  const setDiffA = a.setsWon - a.setsLost;
  const setDiffB = b.setsWon - b.setsLost;
  if (setDiffB !== setDiffA) {
    return setDiffB - setDiffA;
  }

  // 3. Point differential
  const pointDiffA = a.pointsFor - a.pointsAgainst;
  const pointDiffB = b.pointsFor - b.pointsAgainst;
  return pointDiffB - pointDiffA;
}
