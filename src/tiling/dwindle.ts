import type { TileRect, TilingAlgorithm } from "../types";

/**
 * Dwindle (halving) tiling: each window but the last takes half of the
 * remaining free region, alternating split axis (vertical, horizontal,
 * vertical, ...) so every insertion shrinks the free region toward one
 * corner. The final window takes whatever remains.
 */
export const dwindle: TilingAlgorithm = (windows) => {
  const rects: TileRect[] = [];
  let x = 0;
  let y = 0;
  let width = 1;
  let height = 1;

  windows.forEach((w, i) => {
    if (i === windows.length - 1) {
      rects.push({ id: w.id, x, y, width, height });
      return;
    }

    if (i % 2 === 0) {
      const w1 = width / 2;
      rects.push({ id: w.id, x, y, width: w1, height });
      x += w1;
      width -= w1;
    } else {
      const h1 = height / 2;
      rects.push({ id: w.id, x, y, width, height: h1 });
      y += h1;
      height -= h1;
    }
  });

  return rects;
};
