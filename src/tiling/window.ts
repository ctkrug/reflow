import type { TileWindow } from "../types";

let nextId = 0;

/** Creates a new window at a normalized position, auto-assigning an id. */
export function createWindow(
  x: number,
  y: number,
  width: number,
  height: number,
): TileWindow {
  nextId += 1;
  return { id: `w${nextId}`, x, y, width, height };
}
