import { describe, expect, it, vi } from "vitest";
import { WindowStore } from "../src/tiling/windowStore";
import { createWindow } from "../src/tiling/window";

describe("WindowStore", () => {
  it("starts empty when constructed with no initial windows", () => {
    const store = new WindowStore();
    expect(store.getWindows()).toEqual([]);
  });

  it("seeds from an initial window list without aliasing the input array", () => {
    const seed = [createWindow(0, 0, 1, 1)];
    const store = new WindowStore(seed);
    seed.push(createWindow(0, 0, 1, 1));
    expect(store.getWindows()).toHaveLength(1);
  });

  it("appends windows in insertion order via add", () => {
    const store = new WindowStore();
    const a = createWindow(0, 0, 0.5, 0.5);
    const b = createWindow(0.5, 0.5, 0.5, 0.5);
    store.add(a);
    store.add(b);
    expect(store.getWindows().map((w) => w.id)).toEqual([a.id, b.id]);
  });

  it("removeLast drops only the most recently added window", () => {
    const store = new WindowStore();
    const a = createWindow(0, 0, 0.5, 0.5);
    const b = createWindow(0.5, 0.5, 0.5, 0.5);
    store.add(a);
    store.add(b);
    store.removeLast();
    expect(store.getWindows().map((w) => w.id)).toEqual([a.id]);
  });

  it("removeLast on an empty store is a no-op", () => {
    const store = new WindowStore();
    expect(() => store.removeLast()).not.toThrow();
    expect(store.getWindows()).toEqual([]);
  });

  it("notifies subscribers immediately with the current snapshot", () => {
    const store = new WindowStore([createWindow(0, 0, 1, 1)]);
    const listener = vi.fn();
    store.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toHaveLength(1);
  });

  it("notifies subscribers on add and removeLast, and stops after unsubscribe", () => {
    const store = new WindowStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.add(createWindow(0, 0, 1, 1));
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.add(createWindow(0, 0, 1, 1));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("returns a defensive copy from getWindows", () => {
    const store = new WindowStore([createWindow(0, 0, 1, 1)]);
    const snapshot = store.getWindows();
    snapshot.push(createWindow(0, 0, 1, 1));
    expect(store.getWindows()).toHaveLength(1);
  });
});
