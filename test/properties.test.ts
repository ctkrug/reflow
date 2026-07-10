import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { clampUnit } from "../src/interaction/clamp";
import { bsp } from "../src/tiling/bsp";
import { dwindle } from "../src/tiling/dwindle";
import { masterStack } from "../src/tiling/masterStack";
import { reorderWindows } from "../src/tiling/reorder";
import { spiral } from "../src/tiling/spiral";
import { createWindow } from "../src/tiling/window";
import type { TilingAlgorithm } from "../src/types";
import { assertTilesUnitSquare } from "./geometry";

function windows(n: number) {
  return Array.from({ length: n }, () => createWindow(0, 0, 0.1, 0.1));
}

const ALGORITHMS: Array<[string, TilingAlgorithm]> = [
  ["bsp", bsp],
  ["spiral", spiral],
  ["masterStack", masterStack],
  ["dwindle", dwindle],
];

describe("tiling algorithms (property-based)", () => {
  for (const [name, algorithm] of ALGORITHMS) {
    it(`${name} tiles the unit square with no overlaps for any window count`, () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 40 }), (n) => {
          const rects = algorithm(windows(n));
          expect(rects).toHaveLength(n);
          if (n > 0) assertTilesUnitSquare(rects);
        }),
        { numRuns: 30 },
      );
    });
  }
});

describe("reorderWindows (property-based)", () => {
  it("always returns a permutation of the input windows, never dropping or duplicating one", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.nat(),
        fc.nat(),
        (n, a, b) => {
          const list = windows(n);
          const draggedId = list[a % n].id;
          const targetId = list[b % n].id;

          const result = reorderWindows(list, draggedId, targetId);

          expect(result.map((w) => w.id).sort()).toEqual(
            list.map((w) => w.id).sort(),
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("clampUnit (property-based)", () => {
  it("always returns a value inside [0, 1] for any finite number", () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), (n) => {
        const result = clampUnit(n);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      }),
    );
  });

  it("always returns a finite value, even for NaN or Infinity", () => {
    fc.assert(
      fc.property(fc.double(), (n) => {
        expect(Number.isFinite(clampUnit(n))).toBe(true);
      }),
    );
  });
});
