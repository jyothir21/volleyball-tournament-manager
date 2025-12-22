import type { Match, Team, CourtId } from "../models.js";

export interface Round {
  roundNumber: number;
  matches: Match[];
}

/**
 * Generate a round-robin schedule.
 * Each team plays every other team exactly once.
 */
export function generateRoundRobinSchedule(
  teams: Team[],
  courts: CourtId[]
): Round[] {
  if (teams.length < 2) {
    return [];
  }

  // Clone array so we don't mutate caller data
  const teamList = [...teams];

  // If odd number of teams, add a dummy "bye"
  const hasBye = teamList.length % 2 === 1;
  if (hasBye) {
    teamList.push({ id: "__BYE__", name: "BYE" });
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const rounds: Round[] = [];

  for (let round = 0; round < numRounds; round++) {
    const matches: Match[] = [];
    const usedCourts = courts.slice(0);

    for (let i = 0; i < numTeams / 2; i++) {
      const teamA = teamList[i];
      const teamB = teamList[numTeams - 1 - i];

      // Skip BYE matches
      if (teamA.id === "__BYE__" || teamB.id === "__BYE__") {
        continue;
      }

      if (usedCourts.length === 0) {
        break;
      }

      const courtId = usedCourts.shift();

      matches.push({
        id: `r${round + 1}-m${matches.length + 1}`,
        teamAId: teamA.id,
        teamBId: teamB.id,
        courtId,
      });
    }

    rounds.push({
      roundNumber: round + 1,
      matches,
    });

    // Rotate teams (keep first fixed)
    const fixed = teamList[0];
    const rest = teamList.slice(1);
    rest.unshift(rest.pop()!);
    teamList.splice(0, teamList.length, fixed, ...rest);
  }

  return rounds;
}
