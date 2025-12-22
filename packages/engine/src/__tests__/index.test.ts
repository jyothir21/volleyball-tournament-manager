import { describe, expect, it } from "vitest";
import { helloEngine } from "../index.js";

describe("engine", () => {
  it("boots", () => {
    expect(helloEngine()).toBe("engine ready");
  });
});
