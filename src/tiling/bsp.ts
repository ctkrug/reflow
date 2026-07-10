import type { TileRect, TilingAlgorithm } from "../types";

function split(
  ids: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
): TileRect[] {
  if (ids.length === 0) return [];
  if (ids.length === 1) return [{ id: ids[0], x, y, width, height }];

  const mid = Math.ceil(ids.length / 2);
  const first = ids.slice(0, mid);
  const second = ids.slice(mid);

  if (depth % 2 === 0) {
    const firstWidth = width / 2;
    return [
      ...split(first, x, y, firstWidth, height, depth + 1),
      ...split(second, x + firstWidth, y, width - firstWidth, height, depth + 1),
    ];
  }

  const firstHeight = height / 2;
  return [
    ...split(first, x, y, width, firstHeight, depth + 1),
    ...split(second, x, y + firstHeight, width, height - firstHeight, depth + 1),
  ];
}

/**
 * Binary-space-partition tiling: recursively halves the remaining region,
 * alternating split axis by recursion depth, until every window has a rect.
 */
export const bsp: TilingAlgorithm = (windows) =>
  split(
    windows.map((w) => w.id),
    0,
    0,
    1,
    1,
    0,
  );
