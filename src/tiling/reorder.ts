import type { TileWindow } from "../types";

/**
 * Moves `draggedId` to sit immediately before `targetId`'s current slot.
 * Every tiling algorithm here is order-driven, so this is how dragging one
 * window onto another reshapes the layout in all four panes at once.
 *
 * Returns the same array reference (no-op) when the ids are equal or either
 * id isn't present, so callers can skip an unnecessary re-render.
 */
export function reorderWindows(
  windows: TileWindow[],
  draggedId: string,
  targetId: string,
): TileWindow[] {
  if (draggedId === targetId) return windows;

  const draggedIndex = windows.findIndex((w) => w.id === draggedId);
  const targetIndex = windows.findIndex((w) => w.id === targetId);
  if (draggedIndex === -1 || targetIndex === -1) return windows;

  const next = [...windows];
  const [dragged] = next.splice(draggedIndex, 1);
  const insertAt = next.findIndex((w) => w.id === targetId);
  next.splice(insertAt, 0, dragged);
  return next;
}
