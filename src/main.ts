import "./style.css";
import { renderPane } from "./canvas/renderPane";
import { bsp } from "./tiling/bsp";
import { dwindle } from "./tiling/dwindle";
import { masterStack } from "./tiling/masterStack";
import { spiral } from "./tiling/spiral";
import { createWindow } from "./tiling/window";
import { WindowStore } from "./tiling/windowStore";
import type { TileWindow, TilingAlgorithm } from "./types";

interface PaneConfig {
  id: string;
  label: string;
  stamp: string;
  algorithm: TilingAlgorithm;
}

const PANES: PaneConfig[] = [
  { id: "bsp", label: "BSP", stamp: "BSP·01", algorithm: bsp },
  { id: "spiral", label: "Spiral", stamp: "SPIRAL·02", algorithm: spiral },
  { id: "master", label: "Master-Stack", stamp: "MASTER·03", algorithm: masterStack },
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
    throw new Error(`Tiler: expected "${selector}" to be present in the mounted markup`);
  }
  return el;
}

function paneMarkup(pane: PaneConfig): string {
  return `
    <section class="pane" aria-label="${pane.label} layout">
      <canvas class="pane-canvas" data-pane="${pane.id}"></canvas>
    </section>
  `;
}

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <header class="app-header">
      <p class="wordmark">TILER<span class="wordmark-accent">_</span></p>
      <p class="tagline">Four tiling algorithms, one shared window list, live.</p>
    </header>
    <div class="toolbar">
      <button id="add-window" type="button" class="btn btn-primary">+ Add window</button>
      <button id="remove-window" type="button" class="btn">− Remove last</button>
      <span id="window-count" class="window-count" role="status" aria-live="polite"></span>
    </div>
    <main class="pane-grid">
      ${PANES.map(paneMarkup).join("")}
    </main>
  `;

  const addButton = requireElement(root, "#add-window", HTMLButtonElement);
  const removeButton = requireElement(root, "#remove-window", HTMLButtonElement);
  const countLabel = requireElement(root, "#window-count", HTMLElement);

  const canvases = new Map<string, HTMLCanvasElement>();
  PANES.forEach((pane) => {
    const canvas = root.querySelector(`canvas[data-pane="${pane.id}"]`);
    if (canvas instanceof HTMLCanvasElement) canvases.set(pane.id, canvas);
  });

  const store = new WindowStore(SEED_GEOMETRY.map(([x, y, w, h]) => createWindow(x, y, w, h)));

  function render(windows: TileWindow[]): void {
    countLabel.textContent = `${windows.length} window${windows.length === 1 ? "" : "s"}`;
    removeButton.disabled = windows.length === 0;
    PANES.forEach((pane) => {
      const canvas = canvases.get(pane.id);
      if (!canvas) return;
      const rects = pane.algorithm(windows);
      renderPane(canvas, rects, { stamp: pane.stamp, count: windows.length });
    });
  }

  addButton.addEventListener("click", () => store.add(randomWindow()));
  removeButton.addEventListener("click", () => store.removeLast());
  store.subscribe(render);

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => render(store.getWindows()));
  });
}

const app = document.querySelector("#app");
if (app instanceof HTMLElement) mountApp(app);
