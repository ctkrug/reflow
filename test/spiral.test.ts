import { describe, expect, it } from "vitest";
import { spiral } from "../src/tiling/spiral";
import { createWindow } from "../src/tiling/window";
import { assertTilesUnitSquare } from "./geometry";

function windows(n: number) {
  return Array.from({ length: n }, () => createWindow(0, 0, 0.1, 0.1));
}

describe("spiral", () => {
  it("returns an empty layout for zero windows", () => {
    expect(spiral([])).toEqual([]);
  });

  it("gives a single window the full unit square", () => {
    const [w] = windows(1);
    expect(spiral([w])).toEqual([{ id: w.id, x: 0, y: 0, width: 1, height: 1 }]);
  });

  it("splits two windows with no overlap and full coverage", () => {
    const rects = spiral(windows(2));
    assertTilesUnitSquare(rects);
    expect(rects).toHaveLength(2);
  });

  it("tiles five windows with no overlaps and full coverage", () => {
    const rects = spiral(windows(5));
    assertTilesUnitSquare(rects);
    expect(rects).toHaveLength(5);
  });

  it("rotates right, down, left, up across a 4-window case", () => {
    const [a, b, c, d] = windows(4);
    const rects = spiral([a, b, c, d]);
    const byId = Object.fromEntries(rects.map((r) => [r.id, r]));

    expect(byId[a.id]).toEqual({ id: a.id, x: 0, y: 0, width: 0.5, height: 1 });
    expect(byId[b.id]).toEqual({ id: b.id, x: 0.5, y: 0, width: 0.5, height: 0.5 });
    expect(byId[c.id]).toEqual({ id: c.id, x: 0.75, y: 0.5, width: 0.25, height: 0.5 });
    expect(byId[d.id]).toEqual({ id: d.id, x: 0.5, y: 0.5, width: 0.25, height: 0.5 });
  });

  it("shrinks each successive fraction of the remaining region", () => {
    const rects = spiral(windows(4));
    const areas = rects.map((r) => r.width * r.height);
    expect(areas[0]).toBeGreaterThan(areas[1]);
    expect(areas[1]).toBeGreaterThan(areas[2]);
  });

  it("tiles the unit square for a range of window counts (property check)", () => {
    for (let n = 1; n <= 12; n += 1) {
      const rects = spiral(windows(n));
      expect(rects).toHaveLength(n);
      assertTilesUnitSquare(rects);
    }
  });
});
