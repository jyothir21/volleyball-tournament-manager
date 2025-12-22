import { describe, expect, it } from "vitest";
import type { Team, Match } from "../models.js";
import { MatchStatus } from "../models.js";

describe("tournament domain models", () => {
  it("allows creating a basic match", () => {
    const teamA: Team = { id: "A", name: "Team A" };
    const teamB: Team = { id: "B", name: "Team B" };

    const match: Match = {
      id: "m1",
      teamAId: "A",
      teamBId: "B",
      status: MatchStatus.Scheduled,
    };

    expect(match.teamAId).toBe("A");
    expect(match.teamBId).toBe("B");
  });
});
