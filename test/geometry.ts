import { expect } from "vitest";
import type { TileRect } from "../src/types";

const EPSILON = 1e-9;

/** Sums rect areas; used to assert a tiling covers the unit square exactly once. */
export function totalArea(rects: TileRect[]): number {
  return rects.reduce((sum, r) => sum + r.width * r.height, 0);
}

function overlapArea(a: TileRect, b: TileRect): number {
  const xOverlap = Math.max(
    0,
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x),
  );
  const yOverlap = Math.max(
    0,
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y),
  );
  return xOverlap * yOverlap;
}

/** Asserts no pair of rects overlaps by more than a floating-point epsilon. */
export function assertNoOverlaps(rects: TileRect[]): void {
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      expect(overlapArea(rects[i], rects[j])).toBeLessThan(EPSILON);
    }
  }
}

/** Asserts the rects exactly tile the [0,1]x[0,1] unit square: full coverage, no overlaps. */
export function assertTilesUnitSquare(rects: TileRect[]): void {
  assertNoOverlaps(rects);
  expect(totalArea(rects)).toBeCloseTo(1, 9);
}
