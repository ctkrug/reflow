# Architecture — Tiler

A concise map of the codebase for anyone picking this up cold.

## Data flow

```
WindowStore (src/tiling/windowStore.ts)
  holds the single TileWindow[] list
        │
        │ subscribe() fires on every add()/removeLast()/moveWindow()/reorder()
        ▼
main.ts render(windows)
        │
        │ for each of the 4 panes:
        ▼
tiling algorithm (bsp | spiral | masterStack | dwindle)
  pure function: TileWindow[] -> TileRect[]
        │
        │ beginTransition(previousRects, nextRects, now)
        ▼
per-pane animation state (src/canvas/animation.ts)
  a single rAF loop samples every pane each frame (sampleAnimation)
        │
        ▼
renderPane (src/canvas/renderPane.ts)
  draws the grid, rects (at their tweened position/opacity), the
  cross-pane highlight, and the corner stamp onto that pane's <canvas>
        ▲
        │ pointerdown/move/up on a pane's canvas
        │ (src/interaction/hitTest.ts + pointer.ts)
main.ts drag/hover wiring ──► store.reorder() / store.moveWindow()
```

Everything downstream of `WindowStore` is a pure function of the current
window list — no pane keeps its own copy of state, so the four panes can
never drift out of sync with each other or with what the user did. All
four tiling algorithms are **order-driven, not position-driven**: they
read `windows` insertion order, not `x`/`y`. That's why dragging one
window onto another (a reorder) is what makes a drag visibly reflow every
pane, not a free-form move of raw coordinates.

## Modules

- **`src/types.ts`** — `TileWindow` (a window in normalized `[0,1]`
  coordinates), `TileRect` (a placed rect from an algorithm), and the
  `TilingAlgorithm` function type every algorithm implements.
- **`src/tiling/window.ts`** — `createWindow(x, y, width, height)`, the one
  place window ids are minted.
- **`src/tiling/windowStore.ts`** — `WindowStore`: the shared, observable
  window list. `add`/`removeLast` mutate it and notify subscribers;
  `moveWindow(id, x, y)` clamps a dragged window's dropped position into
  `[0,1]`; `reorder(draggedId, targetId)` moves a window before another's
  slot (via `reorderWindows`); `moveByOffset(id, offset)` moves a window
  earlier/later by a relative slot count, clamped at the list ends — the
  keyboard-reorder equivalent of `reorder`; `subscribe` fires immediately
  with the current snapshot, then again on every change.
- **`src/tiling/reorder.ts`** — `reorderWindows`: pure array-reorder used
  by drag-to-reposition, since every algorithm below is order-driven.
- **`src/tiling/bsp.ts`, `spiral.ts`, `masterStack.ts`, `dwindle.ts`** — the
  four tiling algorithms. Each is a pure `(windows) => rects` function with
  no DOM/canvas dependency, so they're unit-tested (`test/*.test.ts`) in
  isolation via geometric properties (full coverage, no overlaps) rather
  than pixel snapshots. `test/geometry.ts` holds the shared assertion
  helpers (`assertTilesUnitSquare`).
- **`src/interaction/clamp.ts`** — `clampUnit`: clamps a value into `[0,1]`.
- **`src/interaction/hitTest.ts`** — `findRectAt` (which rect, if any, a
  point is inside — drag start) and `nearestRectId` (the closest other
  rect to a point, excluding one id — drop target), both pure geometry
  over `TileRect[]`.
- **`src/interaction/pointer.ts`** — `normalizedPoint`: maps a client-space
  pointer coordinate into normalized `[0,1]` space given an element's
  bounding box, as plain arithmetic (no DOMRect dependency, so testable).
- **`src/canvas/easing.ts`** — `easeOutCubic`, shared by all reflow tweens.
- **`src/canvas/animation.ts`** — the tween engine, entirely pure/testable
  (time is always passed in, never read from the clock):
  `diffRects(previous, next)` classifies every window id as moved/added/
  removed; `sampleTransition` renders one id's transition at an elapsed
  time (move: ease-out lerp, add/remove: scale+fade); `beginTransition`/
  `sampleAnimation` wrap those into the per-pane state `main.ts` drives
  from a single `requestAnimationFrame` loop, so all four panes tween in
  lockstep and read as one simultaneous event.
- **`src/canvas/layout.ts`** — `toPixelRect`, the one piece of rendering
  math (normalized rect → CSS pixel rect) worth unit-testing on its own,
  kept separate from the canvas-drawing calls that need a real DOM.
- **`src/canvas/theme.ts`** — canvas-side color/spacing tokens mirroring
  the CSS custom properties in `src/style.css`, so canvas drawing and CSS
  styling read from the same blueprint palette (including the amber
  highlight tokens for the cross-pane hover/drag state).
- **`src/canvas/renderPane.ts`** — `renderPane(canvas, rects, options)`:
  sizes the canvas backing store to `devicePixelRatio`, draws the
  grid-paper background, each rect at its given opacity (or a designed
  empty-state prompt when there are none) with the amber highlight style
  when its id matches `options.highlightId`, and the corner title-block
  stamp (algorithm name + live count). Not unit-tested — it's a thin,
  DOM-dependent drawing layer over the tested `toPixelRect`.
- **`src/main.ts`** — `mountApp(root)`: builds the toolbar + 4-pane grid
  markup, wires add/remove buttons to the `WindowStore`, subscribes to
  begin a tweened transition on every change, drives the shared rAF loop,
  wires pointerdown/move/up/cancel/leave on each pane's canvas for
  drag-to-reorder and cross-pane hover highlight, and repaints on window
  resize. Checks `prefers-reduced-motion` once at mount (and on change)
  and skips tweening entirely when set, painting the settled layout
  instantly. Each pane canvas is also `tabindex="0"` with a `keydown`
  handler: arrow keys cycle the selected window (reusing the same
  `hoveredId` state that drives cross-pane highlight, so keyboard
  selection highlights identically to hover), Enter/Space toggles a
  "grabbed" id, arrow keys while grabbed call `store.moveByOffset`, and
  Enter/Escape drops or cancels. A visually-hidden `#kbd-status` live
  region (`.sr-only` in `style.css`) announces each step for screen
  readers; `focusout` releases any in-progress grab/selection.
- **`src/style.css`** — the blueprint visual system: CSS custom properties
  for every token in `docs/DESIGN.md`, the grid-paper body background,
  themed button states (hover/focus-visible/active/disabled), the
  responsive 2×2-desktop / stacked-phone pane grid, and `touch-action:
none` + grab/grabbing cursors on the pane canvases for dragging.

## How to run / test

```bash
npm install
npm run dev        # Vite dev server, opens straight into the live grid
npm test            # vitest: all tiling algorithms + WindowStore + layout
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
npm run format:check # prettier --check
npm run build         # tsc --noEmit && vite build -> dist/
```

## Extending

- **A new tiling algorithm**: add `src/tiling/<name>.ts` implementing
  `TilingAlgorithm`, add its tests, then add one entry to the `PANES` array
  in `main.ts` (label, corner stamp, algorithm reference) — the grid,
  toolbar, and store wiring need no changes.
- **A position-aware algorithm**: today all four algorithms ignore
  `TileWindow.x/y` (order-driven only) even though `moveWindow` persists a
  dragged window's dropped position. An algorithm that wants to use it can
  read `windows[i].x/y` directly — the store already carries it.
- **Tuning the reflow tween**: `src/canvas/animation.ts`'s
  `DEFAULT_DURATIONS` controls move/add/remove timing; everything else in
  that module takes an explicit `now`/`elapsedMs`, so tests exercise exact
  frames without fake timers.
