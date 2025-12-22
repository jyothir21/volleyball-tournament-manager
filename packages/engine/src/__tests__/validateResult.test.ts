import { describe, expect, it } from "vitest";
import { validateAndCreateMatchResult } from "../results/validateResult.js";

describe("validateAndCreateMatchResult", () => {
  it("derives winner correctly", () => {
    const result = validateAndCreateMatchResult("A", "B", [
      { teamA: 25, teamB: 20 },
      { teamA: 25, teamB: 18 },
    ]);

    expect(result.winnerTeamId).toBe("A");
  });

  it("rejects tied sets", () => {
    expect(() =>
      validateAndCreateMatchResult("A", "B", [{ teamA: 25, teamB: 25 }])
    ).toThrow();
  });
});
