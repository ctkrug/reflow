/** A single window on the canvas, in normalized [0, 1] coordinates. */
export interface TileWindow {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A placed rectangle produced by a tiling algorithm for one window. */
export interface TileRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Takes the insertion-ordered window list and returns their tiled layout. */
export type TilingAlgorithm = (windows: TileWindow[]) => TileRect[];
