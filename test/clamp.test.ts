import { describe, expect, it } from "vitest";
import { clampUnit } from "../src/interaction/clamp";

describe("clampUnit", () => {
  it("passes through values already inside [0, 1]", () => {
    expect(clampUnit(0.42)).toBe(0.42);
  });

  it("clamps values below 0 up to 0", () => {
    expect(clampUnit(-0.5)).toBe(0);
  });

  it("clamps values above 1 down to 1", () => {
    expect(clampUnit(1.5)).toBe(1);
  });

  it("passes through the exact boundary values unchanged", () => {
    expect(clampUnit(0)).toBe(0);
    expect(clampUnit(1)).toBe(1);
  });
});
