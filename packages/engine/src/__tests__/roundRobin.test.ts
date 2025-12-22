import { describe, expect, it } from "vitest";
import { generateRoundRobinSchedule } from "../schedule/roundRobin.js";
import type { Team } from "../models.js";

describe("round robin schedule", () => {
  const teams: Team[] = [
    { id: "A", name: "Team A" },
    { id: "B", name: "Team B" },
    { id: "C", name: "Team C" },
    { id: "D", name: "Team D" }
  ];

  const courts = ["Court 1", "Court 2"];

  it("creates correct number of rounds", () => {
    const rounds = generateRoundRobinSchedule(teams, courts);
    expect(rounds.length).toBe(3); // n - 1 rounds
  });

  it("never schedules a team twice in the same round", () => {
    const rounds = generateRoundRobinSchedule(teams, courts);

    for (const round of rounds) {
      const seen = new Set<string>();

      for (const match of round.matches) {
        expect(seen.has(match.teamAId)).toBe(false);
        expect(seen.has(match.teamBId)).toBe(false);

        seen.add(match.teamAId);
        seen.add(match.teamBId);
      }
    }
  });

  it("ensures each pair of teams plays exactly once", () => {
    const rounds = generateRoundRobinSchedule(teams, courts);
    const pairs = new Set<string>();

    for (const round of rounds) {
      for (const match of round.matches) {
        const key = [match.teamAId, match.teamBId].sort().join("-");
        pairs.add(key);
      }
    }

    expect(pairs.size).toBe(6); // 4 choose 2
  });
});
