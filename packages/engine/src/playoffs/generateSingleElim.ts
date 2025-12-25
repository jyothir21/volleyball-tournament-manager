import type { PlayoffBracket, PlayoffMatch, StandingsRow } from "../models.js";
import { MatchStatus } from "../models.js";

export function generateSingleEliminationBracket(
  standings: StandingsRow[]
): PlayoffBracket {
  const seeds = standings.map((s) => s.teamId);

  const size = Math.pow(2, Math.floor(Math.log2(seeds.length)));
  const qualified = seeds.slice(0, size);

  const rounds: PlayoffBracket["rounds"] = [];
  let currentTeams = qualified;
  let roundNumber = 1;

  while (currentTeams.length > 1) {
    const matches: PlayoffMatch[] = [];

    for (let i = 0; i < currentTeams.length / 2; i++) {
      matches.push({
        id: `p${roundNumber}-m${i + 1}`,
        teamAId: currentTeams[i],
        teamBId: currentTeams[currentTeams.length - 1 - i],
        status: MatchStatus.Scheduled,
      });
    }

    rounds.push({ roundNumber, matches });
    currentTeams = new Array(matches.length).fill(null);
    roundNumber++;
  }

  // Link winners to next round
  for (let r = 0; r < rounds.length - 1; r++) {
    const current = rounds[r];
    const next = rounds[r + 1];

    current.matches.forEach((m, i) => {
      m.winnerToMatchId = next.matches[Math.floor(i / 2)].id;
    });
  }

  return { rounds };
}
