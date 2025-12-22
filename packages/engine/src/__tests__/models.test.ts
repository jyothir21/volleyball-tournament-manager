import { describe, expect, it } from "vitest";
import type { Team, Match } from "../models.js";

describe("tournament domain models", () => {
  it("allows creating a basic match", () => {
    const teamA: Team = { id: "A", name: "Team A" };
    const teamB: Team = { id: "B", name: "Team B" };

    const match: Match = {
      id: "match-1",
      teamAId: teamA.id,
      teamBId: teamB.id,
    };

    expect(match.teamAId).toBe("A");
    expect(match.teamBId).toBe("B");
  });
});
