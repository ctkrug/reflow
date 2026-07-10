import { clampUnit } from "../interaction/clamp";
import type { TileWindow } from "../types";
import { reorderWindows } from "./reorder";

type Listener = (windows: TileWindow[]) => void;

/**
 * Holds the single shared window list every tiling pane renders from, so no
 * pane can drift out of sync with what the user actually did.
 */
export class WindowStore {
  private windows: TileWindow[] = [];
  private readonly listeners = new Set<Listener>();

  constructor(initial: TileWindow[] = []) {
    this.windows = [...initial];
  }

  getWindows(): TileWindow[] {
    return [...this.windows];
  }

  add(window: TileWindow): void {
    this.windows = [...this.windows, window];
    this.emit();
  }

  /** Removes the most recently added window. No-op when the list is empty. */
  removeLast(): void {
    if (this.windows.length === 0) return;
    this.windows = this.windows.slice(0, -1);
    this.emit();
  }

  /**
   * Updates a window's position, clamping both axes into [0, 1] so a drag
   * released outside the canvas bounds can't lose the window off-screen.
   * A no-op when the id isn't present.
   */
  moveWindow(id: string, x: number, y: number): void {
    const index = this.windows.findIndex((w) => w.id === id);
    if (index === -1) return;

    const next = [...this.windows];
    next[index] = { ...next[index], x: clampUnit(x), y: clampUnit(y) };
    this.windows = next;
    this.emit();
  }

  /** Moves `draggedId` to sit before `targetId`'s slot. No-op when either id is missing. */
  reorder(draggedId: string, targetId: string): void {
    const next = reorderWindows(this.windows, draggedId, targetId);
    if (next === this.windows) return;

    this.windows = next;
    this.emit();
  }

  /** Subscribes to changes, firing once immediately with the current list. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getWindows());
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const snapshot = this.getWindows();
    for (const listener of this.listeners) listener(snapshot);
  }
}
