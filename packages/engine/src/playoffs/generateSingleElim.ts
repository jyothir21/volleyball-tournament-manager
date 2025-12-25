import type { Match, PlayoffBracket, StandingsRow } from "../models.js";
import { MatchStatus } from "../models.js";

/**
 * Generate a single-elimination playoff bracket
 * Teams are seeded from standings (highest seed vs lowest seed).
 */
export function generateSingleEliminationBracket(
  standings: StandingsRow[]
): PlayoffBracket {
  const seeds = standings.map((s) => s.teamId);

  // Ensure power of two by trimming lowest seeds (simple version)
  const size = Math.pow(2, Math.floor(Math.log2(seeds.length)));
  const qualified = seeds.slice(0, size);

  const rounds: PlayoffBracket["rounds"] = [];

  let currentTeams = qualified;
  let roundNumber = 1;

  while (currentTeams.length > 1) {
    const matches: Match[] = [];

    for (let i = 0; i < currentTeams.length / 2; i++) {
      const teamAId = currentTeams[i];
      const teamBId = currentTeams[currentTeams.length - 1 - i];

      matches.push({
        id: `p${roundNumber}-m${i + 1}`,
        teamAId,
        teamBId,
        status: MatchStatus.Scheduled,
      });
    }

    rounds.push({ roundNumber, matches });

    // Winners will fill next round later
    currentTeams = matches.map((m) => m.teamAId); // placeholder
    roundNumber++;
  }

  return { rounds };
}
