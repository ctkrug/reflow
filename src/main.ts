import "./style.css";
import {
  beginTransition,
  sampleAnimation,
  type PaneAnimationState,
} from "./canvas/animation";
import { renderPane, type DrawableRect } from "./canvas/renderPane";
import { findRectAt, nearestRectId } from "./interaction/hitTest";
import { normalizedPoint } from "./interaction/pointer";
import { bsp } from "./tiling/bsp";
import { dwindle } from "./tiling/dwindle";
import { masterStack } from "./tiling/masterStack";
import { spiral } from "./tiling/spiral";
import { createWindow } from "./tiling/window";
import { WindowStore } from "./tiling/windowStore";
import type { TileRect, TileWindow, TilingAlgorithm } from "./types";

interface PaneConfig {
  id: string;
  label: string;
  stamp: string;
  algorithm: TilingAlgorithm;
}

const PANES: PaneConfig[] = [
  { id: "bsp", label: "BSP", stamp: "BSP·01", algorithm: bsp },
  { id: "spiral", label: "Spiral", stamp: "SPIRAL·02", algorithm: spiral },
  {
    id: "master",
    label: "Master-Stack",
    stamp: "MASTER·03",
    algorithm: masterStack,
  },
  { id: "dwindle", label: "Dwindle", stamp: "DWINDLE·04", algorithm: dwindle },
];

const SEED_GEOMETRY: Array<[number, number, number, number]> = [
  [0.05, 0.1, 0.3, 0.3],
  [0.4, 0.15, 0.25, 0.35],
  [0.1, 0.5, 0.35, 0.3],
  [0.55, 0.5, 0.3, 0.25],
];

function randomWindow(): TileWindow {
  const width = 0.2 + Math.random() * 0.2;
  const height = 0.2 + Math.random() * 0.2;
  const x = Math.random() * (1 - width);
  const y = Math.random() * (1 - height);
  return createWindow(x, y, width, height);
}

function requireElement<T extends Element>(
  root: ParentNode,
  selector: string,
  ctor: new () => T,
): T {
  const el = root.querySelector(selector);
  if (!(el instanceof ctor)) {
    throw new Error(
      `Tiler: expected "${selector}" to be present in the mounted markup`,
    );
  }
  return el;
}

function paneMarkup(pane: PaneConfig): string {
  return `
    <section class="pane" aria-label="${pane.label} layout">
      <canvas
        class="pane-canvas"
        data-pane="${pane.id}"
        tabindex="0"
        aria-label="${pane.label} layout. Arrow keys select a window, Enter or Space picks it up, arrow keys then reorder it, Enter or Escape drops it."
      ></canvas>
    </section>
  `;
}

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <header class="app-header">
      <p class="wordmark">REFLOW<span class="wordmark-accent">_</span></p>
      <p class="tagline">Four tiling window managers, one window list, reflowing live.</p>
      <a
        class="gh-link"
        href="https://github.com/ctkrug/tiler"
        target="_blank"
        rel="noopener"
        >View on GitHub ↗</a
      >
    </header>
    <div class="toolbar">
      <button id="add-window" type="button" class="btn btn-primary">+ Add window</button>
      <button id="remove-window" type="button" class="btn">− Remove last</button>
      <span id="window-count" class="window-count" role="status" aria-live="polite"></span>
    </div>
    <main class="pane-grid">
      ${PANES.map(paneMarkup).join("")}
    </main>
    <span id="kbd-status" class="sr-only" role="status" aria-live="polite"></span>
  `;

  const addButton = requireElement(root, "#add-window", HTMLButtonElement);
  const removeButton = requireElement(
    root,
    "#remove-window",
    HTMLButtonElement,
  );
  const countLabel = requireElement(root, "#window-count", HTMLElement);
  const kbdStatus = requireElement(root, "#kbd-status", HTMLElement);

  const canvases = new Map<string, HTMLCanvasElement>();
  PANES.forEach((pane) => {
    const canvas = root.querySelector(`canvas[data-pane="${pane.id}"]`);
    if (canvas instanceof HTMLCanvasElement) canvases.set(pane.id, canvas);
  });

  const store = new WindowStore(
    SEED_GEOMETRY.map(([x, y, w, h]) => createWindow(x, y, w, h)),
  );

  /** Each pane's most recently computed (untweened) layout, for drag/hover hit-testing. */
  const paneRects = new Map<string, TileRect[]>();
  const paneAnimations = new Map<string, PaneAnimationState>();
  let hoveredId: string | null = null;
  let dragWindowId: string | null = null;
  let dragPaneId: string | null = null;
  let grabbedId: string | null = null;
  let windowCount = 0;
  let rafHandle = 0;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;
  motionQuery.addEventListener("change", (event) => {
    reducedMotion = event.matches;
  });

  function paintPane(pane: PaneConfig, rects: DrawableRect[]): void {
    const canvas = canvases.get(pane.id);
    if (!canvas) return;
    renderPane(canvas, rects, {
      stamp: pane.stamp,
      count: windowCount,
      highlightId: hoveredId,
    });
  }

  /** Repaints every pane from its settled (untweened) layout — used when idle. */
  function paintIdle(): void {
    if (rafHandle) return; // the animation loop will pick up the latest state next frame
    PANES.forEach((pane) => paintPane(pane, paneRects.get(pane.id) ?? []));
  }

  function tick(): void {
    const now = performance.now();
    let stillAnimating = false;
    PANES.forEach((pane) => {
      const state = paneAnimations.get(pane.id);
      if (!state) return;
      const frame = sampleAnimation(state, now);
      paintPane(pane, frame.rects);
      if (!frame.done) stillAnimating = true;
    });
    rafHandle = stillAnimating ? requestAnimationFrame(tick) : 0;
  }

  function render(windows: TileWindow[]): void {
    windowCount = windows.length;
    countLabel.textContent = `${windowCount} window${windowCount === 1 ? "" : "s"}`;
    removeButton.disabled = windowCount === 0;

    const now = performance.now();
    PANES.forEach((pane) => {
      const previous = paneRects.get(pane.id) ?? [];
      const next = pane.algorithm(windows);
      paneRects.set(pane.id, next);

      if (reducedMotion) {
        paneAnimations.delete(pane.id);
        paintPane(pane, next);
      } else {
        paneAnimations.set(pane.id, beginTransition(previous, next, now));
      }
    });

    if (!reducedMotion) {
      if (!rafHandle) rafHandle = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafHandle);
      rafHandle = 0;
    }
  }

  addButton.addEventListener("click", () => store.add(randomWindow()));
  removeButton.addEventListener("click", () => store.removeLast());
  store.subscribe(render);

  function pointerPoint(event: PointerEvent, canvas: HTMLCanvasElement) {
    const bounds = canvas.getBoundingClientRect();
    return normalizedPoint(
      event.clientX,
      event.clientY,
      bounds.left,
      bounds.top,
      bounds.width,
      bounds.height,
    );
  }

  function setHovered(id: string | null): void {
    if (id === hoveredId) return;
    hoveredId = id;
    paintIdle();
  }

  function announce(message: string): void {
    kbdStatus.textContent = message;
  }

  PANES.forEach((pane) => {
    const canvas = canvases.get(pane.id);
    if (!canvas) return;

    canvas.addEventListener("pointerdown", (event) => {
      if (dragWindowId !== null) return; // a second finger/pointer can't hijack an in-flight drag
      const rects = paneRects.get(pane.id) ?? [];
      const point = pointerPoint(event, canvas);
      const hitId = findRectAt(rects, point);
      if (!hitId) return;
      dragWindowId = hitId;
      dragPaneId = pane.id;
      grabbedId = null; // a pointer drag always supersedes a stale keyboard grab
      canvas.setPointerCapture(event.pointerId);
      setHovered(hitId);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (dragPaneId !== null) {
        if (dragPaneId === pane.id) setHovered(dragWindowId);
        return;
      }
      const rects = paneRects.get(pane.id) ?? [];
      const point = pointerPoint(event, canvas);
      setHovered(findRectAt(rects, point));
    });

    canvas.addEventListener("pointerup", (event) => {
      if (dragPaneId !== pane.id || dragWindowId === null) return;
      const rects = paneRects.get(pane.id) ?? [];
      const point = pointerPoint(event, canvas);
      const targetId = nearestRectId(rects, point, dragWindowId);
      if (targetId) store.reorder(dragWindowId, targetId);
      store.moveWindow(dragWindowId, point.x, point.y);
      dragWindowId = null;
      dragPaneId = null;
      setHovered(null);
    });

    canvas.addEventListener("pointercancel", () => {
      if (dragPaneId !== pane.id) return;
      dragWindowId = null;
      dragPaneId = null;
      setHovered(null);
    });

    canvas.addEventListener("pointerleave", () => {
      if (dragPaneId !== null) return;
      setHovered(null);
    });

    canvas.addEventListener("keydown", (event) => {
      const ids = (paneRects.get(pane.id) ?? []).map((r) => r.id);
      if (ids.length === 0) return;

      const isNext = event.key === "ArrowRight" || event.key === "ArrowDown";
      const isPrev = event.key === "ArrowLeft" || event.key === "ArrowUp";

      if (isNext || isPrev) {
        event.preventDefault();
        const step = isNext ? 1 : -1;
        if (grabbedId) {
          store.moveByOffset(grabbedId, step);
          announce(
            `Moved ${grabbedId} ${isNext ? "later" : "earlier"} in ${pane.label}.`,
          );
          return;
        }
        const currentIndex = hoveredId ? ids.indexOf(hoveredId) : -1;
        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex + step + ids.length) % ids.length;
        setHovered(ids[nextIndex]);
        announce(
          `Selected ${ids[nextIndex]}, window ${nextIndex + 1} of ${ids.length}, in ${pane.label}.`,
        );
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        if (!hoveredId || !ids.includes(hoveredId)) return;
        event.preventDefault();
        if (grabbedId === hoveredId) {
          grabbedId = null;
          announce(`Dropped ${hoveredId} in ${pane.label}.`);
        } else {
          grabbedId = hoveredId;
          announce(
            `Picked up ${hoveredId} in ${pane.label}. Arrow keys reorder it, Enter drops it.`,
          );
        }
        return;
      }

      if (event.key === "Escape" && grabbedId) {
        event.preventDefault();
        announce(`Cancelled reordering ${grabbedId} in ${pane.label}.`);
        grabbedId = null;
      }
    });

    canvas.addEventListener("focusout", () => {
      grabbedId = null;
      setHovered(null);
    });
  });

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => paintIdle());
  });
}

const app = document.querySelector("#app");
if (app instanceof HTMLElement) mountApp(app);
