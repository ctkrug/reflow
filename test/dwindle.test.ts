import { describe, expect, it } from "vitest";
import { dwindle } from "../src/tiling/dwindle";
import { createWindow } from "../src/tiling/window";
import { assertTilesUnitSquare } from "./geometry";

function windows(n: number) {
  return Array.from({ length: n }, () => createWindow(0, 0, 0.1, 0.1));
}

describe("dwindle", () => {
  it("returns an empty layout for zero windows", () => {
    expect(dwindle([])).toEqual([]);
  });

  it("gives a single window the full unit square", () => {
    const [w] = windows(1);
    expect(dwindle([w])).toEqual([{ id: w.id, x: 0, y: 0, width: 1, height: 1 }]);
  });

  it("splits two windows into vertical halves", () => {
    const [a, b] = windows(2);
    const rects = dwindle([a, b]);
    assertTilesUnitSquare(rects);

    const byId = Object.fromEntries(rects.map((r) => [r.id, r]));
    expect(byId[a.id]).toEqual({ id: a.id, x: 0, y: 0, width: 0.5, height: 1 });
    expect(byId[b.id]).toEqual({ id: b.id, x: 0.5, y: 0, width: 0.5, height: 1 });
  });

  it("tiles five windows with no overlaps and full coverage", () => {
    const rects = dwindle(windows(5));
    assertTilesUnitSquare(rects);
    expect(rects).toHaveLength(5);
  });

  it("halves the remaining region strictly decreasing until the final window", () => {
    const rects = dwindle(windows(5));
    const areas = rects.map((r) => r.width * r.height);
    for (let i = 0; i < areas.length - 2; i += 1) {
      expect(areas[i]).toBeGreaterThan(areas[i + 1]);
    }
  });

  it("alternates split axis: even insertions vary x, odd insertions vary y", () => {
    const rects = dwindle(windows(4));
    expect(rects[0].x).toBe(0);
    expect(rects[0].width).toBe(0.5);
    expect(rects[1].x).toBe(0.5);
    expect(rects[1].height).toBe(0.5);
  });

  it("tiles the unit square for a range of window counts (property check)", () => {
    for (let n = 1; n <= 12; n += 1) {
      const rects = dwindle(windows(n));
      expect(rects).toHaveLength(n);
      assertTilesUnitSquare(rects);
    }
  });
});
