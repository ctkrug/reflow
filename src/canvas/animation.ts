import type { TileRect } from "../types";
import { easeOutCubic } from "./easing";

/** A tile rect plus a render-time opacity, for fading window rects in/out. */
export interface RenderRect extends TileRect {
  opacity: number;
}

/** How a single window's rect changed between two tilings, by id. */
export interface RectTransition {
  id: string;
  from: TileRect | null;
  to: TileRect | null;
}

/** Classifies every id across two rect lists as moved, added, or removed. */
export function diffRects(
  previous: TileRect[],
  next: TileRect[],
): RectTransition[] {
  const previousById = new Map(previous.map((r) => [r.id, r]));
  const nextById = new Map(next.map((r) => [r.id, r]));
  const ids = new Set([...previousById.keys(), ...nextById.keys()]);

  return Array.from(ids).map((id) => ({
    id,
    from: previousById.get(id) ?? null,
    to: nextById.get(id) ?? null,
  }));
}

export interface TweenDurations {
  moveMs: number;
  addMs: number;
  removeMs: number;
}

/** Per docs/DESIGN.md's motion spec: 100-140ms reflow, ~120ms add, ~100ms remove. */
export const DEFAULT_DURATIONS: TweenDurations = {
  moveMs: 130,
  addMs: 120,
  removeMs: 100,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpGeometry(from: TileRect, to: TileRect, t: number): TileRect {
  return {
    id: to.id,
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    width: lerp(from.width, to.width, t),
    height: lerp(from.height, to.height, t),
  };
}

/** Scales a rect toward its own center: factor 1 = full size, 0 = a point. */
function scaledAroundCenter(rect: TileRect, factor: number): TileRect {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const width = rect.width * factor;
  const height = rect.height * factor;
  return { id: rect.id, x: cx - width / 2, y: cy - height / 2, width, height };
}

/**
 * Samples one window's transition at `elapsedMs` since it began.
 * Returns null once a removal has fully finished (nothing left to draw).
 */
export function sampleTransition(
  transition: RectTransition,
  elapsedMs: number,
  durations: TweenDurations = DEFAULT_DURATIONS,
): RenderRect | null {
  const { from, to } = transition;

  if (from && to) {
    const t = easeOutCubic(elapsedMs / durations.moveMs);
    return { ...lerpGeometry(from, to, t), opacity: 1 };
  }

  if (!from && to) {
    const t = easeOutCubic(elapsedMs / durations.addMs);
    return {
      ...scaledAroundCenter(to, lerp(0.85, 1, t)),
      opacity: lerp(0, 1, t),
    };
  }

  if (from && !to) {
    if (elapsedMs >= durations.removeMs) return null;
    const t = easeOutCubic(elapsedMs / durations.removeMs);
    return {
      ...scaledAroundCenter(from, lerp(1, 0.85, t)),
      opacity: lerp(1, 0, t),
    };
  }

  return null;
}

/** A pane's in-flight transition set, anchored to a start timestamp. */
export interface PaneAnimationState {
  transitions: RectTransition[];
  startedAt: number;
}

/** Begins tweening a pane from its previous tiling to its next one at time `now`. */
export function beginTransition(
  previous: TileRect[],
  next: TileRect[],
  now: number,
): PaneAnimationState {
  return { transitions: diffRects(previous, next), startedAt: now };
}

export interface AnimationFrame {
  rects: RenderRect[];
  /** True once every transition (move/add/remove) has finished. */
  done: boolean;
}

/** Samples every transition in a pane's animation state at time `now`. */
export function sampleAnimation(
  state: PaneAnimationState,
  now: number,
  durations: TweenDurations = DEFAULT_DURATIONS,
): AnimationFrame {
  if (state.transitions.length === 0) return { rects: [], done: true };

  const elapsed = now - state.startedAt;
  const rects: RenderRect[] = [];
  for (const transition of state.transitions) {
    const sampled = sampleTransition(transition, elapsed, durations);
    if (sampled) rects.push(sampled);
  }

  const maxDuration = Math.max(
    durations.moveMs,
    durations.addMs,
    durations.removeMs,
  );
  return { rects, done: elapsed >= maxDuration };
}
