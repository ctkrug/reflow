import type { TileRect } from "../types";

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Scales a normalized [0,1] tile rect into CSS pixel space for a given pane size. */
export function toPixelRect(rect: TileRect, paneWidth: number, paneHeight: number): PixelRect {
  return {
    x: rect.x * paneWidth,
    y: rect.y * paneHeight,
    width: rect.width * paneWidth,
    height: rect.height * paneHeight,
  };
}
