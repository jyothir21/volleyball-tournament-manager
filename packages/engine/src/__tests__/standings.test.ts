import { describe, expect, it } from "vitest";
import { computeStandings } from "../standings/computeStandings.js";
import type { Match, Team } from "../models.js";

describe("standings computation", () => {
  const teams: Team[] = [
    { id: "A", name: "Team A" },
    { id: "B", name: "Team B" },
  ];

  it("computes wins, losses, and points correctly", () => {
    const matches: Match[] = [
      {
        id: "m1",
        teamAId: "A",
        teamBId: "B",
        result: {
          winnerTeamId: "A",
          sets: [
            { teamA: 25, teamB: 20 },
            { teamA: 25, teamB: 18 },
          ],
        },
      },
    ];

    const standings = computeStandings(teams, matches);

    expect(standings[0].teamId).toBe("A");
    expect(standings[0].wins).toBe(1);
    expect(standings[1].losses).toBe(1);
    expect(standings[0].pointsFor).toBe(50);
    expect(standings[1].pointsAgainst).toBe(50);
  });
});
