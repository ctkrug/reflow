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

  describe("moveWindow", () => {
    it("updates the given window's position and notifies subscribers", () => {
      const a = createWindow(0, 0, 0.2, 0.2);
      const store = new WindowStore([a]);
      const listener = vi.fn();
      store.subscribe(listener);

      store.moveWindow(a.id, 0.3, 0.4);

      expect(store.getWindows()[0]).toMatchObject({ x: 0.3, y: 0.4 });
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("clamps a position dragged outside [0, 1] instead of losing the window", () => {
      const a = createWindow(0, 0, 0.2, 0.2);
      const store = new WindowStore([a]);

      store.moveWindow(a.id, -0.5, 1.8);

      expect(store.getWindows()[0]).toMatchObject({ x: 0, y: 1 });
    });

    it("is a no-op for an id that isn't present", () => {
      const a = createWindow(0, 0, 0.2, 0.2);
      const store = new WindowStore([a]);
      const listener = vi.fn();
      store.subscribe(listener);

      store.moveWindow("ghost", 0.5, 0.5);

      expect(store.getWindows()).toEqual([a]);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("falls back to 0 rather than parking the window at NaN", () => {
      const a = createWindow(0, 0, 0.2, 0.2);
      const store = new WindowStore([a]);

      store.moveWindow(a.id, NaN, NaN);

      expect(store.getWindows()[0]).toMatchObject({ x: 0, y: 0 });
    });
  });

  describe("reorder", () => {
    it("moves the dragged window before the target and notifies subscribers", () => {
      const a = createWindow(0, 0, 0.5, 0.5);
      const b = createWindow(0.5, 0, 0.5, 0.5);
      const store = new WindowStore([a, b]);
      const listener = vi.fn();
      store.subscribe(listener);

      store.reorder(b.id, a.id);

      expect(store.getWindows().map((w) => w.id)).toEqual([b.id, a.id]);
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("does not notify subscribers when the reorder is a no-op", () => {
      const a = createWindow(0, 0, 1, 1);
      const store = new WindowStore([a]);
      const listener = vi.fn();
      store.subscribe(listener);

      store.reorder(a.id, a.id);

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
