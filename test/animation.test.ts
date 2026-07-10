import { describe, expect, it } from "vitest";
import {
  DEFAULT_DURATIONS,
  beginTransition,
  diffRects,
  sampleAnimation,
  sampleTransition,
  targetRects,
  type RectTransition,
} from "../src/canvas/animation";
import type { TileRect } from "../src/types";

const RECT_A: TileRect = { id: "a", x: 0, y: 0, width: 0.5, height: 1 };
const RECT_A_MOVED: TileRect = { id: "a", x: 0.5, y: 0, width: 0.5, height: 1 };
const RECT_B: TileRect = { id: "b", x: 0.5, y: 0, width: 0.5, height: 1 };

describe("diffRects", () => {
  it("classifies an id present in both lists as moved", () => {
    const result = diffRects([RECT_A], [RECT_A_MOVED]);
    expect(result).toEqual([{ id: "a", from: RECT_A, to: RECT_A_MOVED }]);
  });

  it("classifies an id only in the next list as added", () => {
    const result = diffRects([], [RECT_B]);
    expect(result).toEqual([{ id: "b", from: null, to: RECT_B }]);
  });

  it("classifies an id only in the previous list as removed", () => {
    const result = diffRects([RECT_A], []);
    expect(result).toEqual([{ id: "a", from: RECT_A, to: null }]);
  });

  it("handles two empty lists", () => {
    expect(diffRects([], [])).toEqual([]);
  });

  it("classifies an unchanged rect as a zero-distance move", () => {
    const result = diffRects([RECT_A], [RECT_A]);
    expect(result).toEqual([{ id: "a", from: RECT_A, to: RECT_A }]);
  });
});

describe("sampleTransition", () => {
  it("starts a move at the from-rect and ends at the to-rect", () => {
    const transition: RectTransition = {
      id: "a",
      from: RECT_A,
      to: RECT_A_MOVED,
    };
    expect(sampleTransition(transition, 0)).toMatchObject({
      x: 0,
      opacity: 1,
    });
    expect(
      sampleTransition(transition, DEFAULT_DURATIONS.moveMs),
    ).toMatchObject({ x: 0.5, opacity: 1 });
  });

  it("fades an added rect in from 0 to full opacity", () => {
    const transition: RectTransition = { id: "b", from: null, to: RECT_B };
    expect(sampleTransition(transition, 0)?.opacity).toBe(0);
    expect(sampleTransition(transition, DEFAULT_DURATIONS.addMs)?.opacity).toBe(
      1,
    );
  });

  it("fades a removed rect out and then disappears", () => {
    const transition: RectTransition = { id: "a", from: RECT_A, to: null };
    expect(sampleTransition(transition, 0)?.opacity).toBe(1);
    expect(sampleTransition(transition, DEFAULT_DURATIONS.removeMs)).toBeNull();
  });

  it("returns null for a transition with neither from nor to", () => {
    expect(sampleTransition({ id: "x", from: null, to: null }, 0)).toBeNull();
  });
});

describe("beginTransition/sampleAnimation", () => {
  it("samples an in-progress move as not done", () => {
    const state = beginTransition([RECT_A], [RECT_A_MOVED], 1000);
    const frame = sampleAnimation(state, 1000 + DEFAULT_DURATIONS.moveMs / 2);
    expect(frame.done).toBe(false);
    expect(frame.rects).toHaveLength(1);
  });

  it("marks the frame done once every transition duration has elapsed", () => {
    const state = beginTransition([RECT_A], [RECT_A_MOVED], 1000);
    const frame = sampleAnimation(state, 1000 + DEFAULT_DURATIONS.moveMs);
    expect(frame.done).toBe(true);
    expect(frame.rects).toEqual([{ ...RECT_A_MOVED, opacity: 1 }]);
  });

  it("drops fully-faded removed rects from the sampled frame", () => {
    const state = beginTransition([RECT_A, RECT_B], [RECT_B], 0);
    const frame = sampleAnimation(state, DEFAULT_DURATIONS.removeMs);
    expect(frame.rects.map((r) => r.id)).toEqual(["b"]);
  });

  it("is immediately done for an unchanged (empty) transition set", () => {
    const state = beginTransition([], [], 0);
    expect(sampleAnimation(state, 0).done).toBe(true);
  });
});

describe("targetRects", () => {
  it("returns only the rects a transition is heading toward", () => {
    const state = beginTransition([RECT_A], [RECT_A_MOVED, RECT_B], 0);
    expect(targetRects(state)).toEqual(
      expect.arrayContaining([RECT_A_MOVED, RECT_B]),
    );
  });

  it("excludes rects that are being removed (no to-rect)", () => {
    const state = beginTransition([RECT_A], [], 0);
    expect(targetRects(state)).toEqual([]);
  });
});
