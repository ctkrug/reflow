import { describe, expect, it } from "vitest";
import { easeOutCubic } from "../src/canvas/easing";

describe("easeOutCubic", () => {
  it("maps 0 to 0 and 1 to 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("front-loads progress (t=0.5 is more than half done)", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("is monotonically non-decreasing across the range", () => {
    const samples = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map(easeOutCubic);
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
    }
  });

  it("clamps input outside [0, 1]", () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });
});
