# Backlog — Tiler

Epics are ordered so the wow moment ships first. Every story has concrete,
checkable acceptance criteria — no vibes.

## Epic 1 — Core tiling engines & live canvas (the wow moment)

### [x] 1.1 Four-pane live comparison canvas — **WOW MOMENT**

Drop five rectangles onto the canvas and see all four algorithms (BSP,
spiral, master-stack, dwindle) lay them out simultaneously, side by side,
in one page.

- Adding a 5th window updates all four panes within the same interaction
  (no manual refresh/switch needed to see all four).
- Each pane visibly produces a _different_ layout for the same 5 windows
  (not four copies of one algorithm).
- Works with zero setup: `npm run dev` and the four-pane grid is the first
  thing rendered, no extra clicks to reach it.

### [x] 1.2 BSP tiling algorithm

Implement binary-space-partition tiling as a pure function.

- `bsp([])` returns `[]`; `bsp([w])` returns one rect covering the full
  `[0,1]×[0,1]` area.
- For N windows, the algorithm alternates split axis by depth and every
  returned rect's area sums to 1.0 (± floating point epsilon) with no
  overlaps.
- Unit tests cover N = 0, 1, 2, 5 windows.

### [x] 1.3 Spiral tiling algorithm

Implement spiral (fibonacci-style) tiling as a pure function.

- Each successive window takes a shrinking fraction of the remaining space,
  rotating direction (right/down/left/up) each step.
- For N ≥ 2 windows, no two returned rects overlap and their union covers
  the full `[0,1]×[0,1]` area.
- Unit tests cover N = 0, 1, 2, 5 windows and assert the rotation order of
  at least one 4-window case.

### [x] 1.4 Master-stack tiling algorithm

Implement master-pane + stack tiling as a pure function.

- The first window always occupies a configurable master fraction (default
  0.5) of one side; remaining windows split the rest evenly in a stack.
- Adding a 6th window resizes the existing 5 stacked rects rather than
  overflowing the canvas bounds.
- Unit tests cover N = 0, 1, 2, 5 windows and verify the master rect's
  width fraction.

### [x] 1.5 Dwindle tiling algorithm

Implement dwindle (halving) tiling as a pure function.

- Each new window halves the remaining free region, alternating split
  axis, producing a strictly decreasing rect size per insertion order.
- For N windows, all returned rects tile `[0,1]×[0,1]` with no gaps or
  overlaps (checked via summed area).
- Unit tests cover N = 0, 1, 2, 5 windows.

### [x] 1.6 Add/remove windows via UI controls

A toolbar lets the user add a window and remove the most recently added
one, driving the shared window list all four panes consume.

- Clicking "add window" appends a window and all four panes re-tile within
  one animation frame.
- Clicking "remove" with zero windows present is a no-op (no crash, no
  negative-count state).
- The toolbar shows the current window count and updates it on every
  add/remove.

## Epic 2 — Interaction & comparison UX

### [ ] 2.1 Drag windows to reposition, live reflow across all four panes

Dragging a window rectangle in any one pane updates that window's position
in the shared state and re-tiles all four panes.

- Dragging in pane A visibly changes the layout in panes B, C, and D (not
  just pane A).
- Releasing outside the canvas bounds clamps the window back into
  `[0,1]×[0,1]` rather than losing it off-canvas.
- Drag start/end are both mouse- and touch-driven (works on a touchscreen).

### [ ] 2.2 Cross-pane window highlight

Hovering a window rectangle in one pane highlights the same window's
rectangle (by id) in the other three panes simultaneously.

- Hovering window `w3` in the BSP pane applies the highlight style to
  `w3`'s rect in the spiral, master-stack, and dwindle panes at the same
  time.
- Moving the mouse off all panes clears every highlight.

### [x] 2.3 Per-pane title-block labels + live rect count

Each of the four panes is labeled with its algorithm name and a live count
of tiled windows, per the DESIGN.md signature-detail spec.

- Each pane shows a distinct, correctly-matched label (`BSP`, `SPIRAL`,
  `MASTER-STACK`, `DWINDLE`) — not generic "Pane 1..4".
- The count updates immediately after any add/remove.

### [x] 2.4 Responsive layout: desktop 2×2 grid, phone stacked

The four-pane grid composes at both 1440×900 and 390×844 with no
horizontal scroll or overlap.

- At 1440px width, all four panes are visible at once in a 2×2 grid filling
  ≥60% of the viewport height.
- At 390px width, panes stack vertically and are individually scrollable
  to, with no pane narrower than its content requires (no horizontal
  scrollbar appears).

## Epic 3 — Design polish & deployment

### [x] 3.1 Apply the blueprint visual system

Implement the tokens, fonts, and grid background from `docs/DESIGN.md`
across the whole app.

- The two chosen fonts (JetBrains Mono, Inter) are loaded and applied to
  the wordmark/labels vs. body text respectively, not the browser default.
- The grid-paper background and cyan/near-black token colors from
  DESIGN.md are visibly present, not a generic dark-gray-cards look.
- Every interactive control (add/remove buttons) has distinct hover,
  focus-visible, active, and disabled states.

### [ ] 3.2 Reflow, add, and remove animation

Implement the juice plan's tweens for layout changes.

- A rect that moves between two tilings animates over 100–140ms ease-out
  rather than jumping instantly.
- A newly added window's rect scales/fades in over ~120ms; a removed one
  fades/shrinks over ~100ms before the remaining rects tween to their new
  slots.
- `prefers-reduced-motion: reduce` disables the tweens (rects update
  instantly) without breaking layout correctness.

### [x] 3.3 Favicon and wordmark brand assets

Ship a generated (code-based, no binary asset) favicon and a designed
wordmark treatment.

- `index.html` references a favicon that is not the default browser globe
  and uses the DESIGN.md accent color.
- The "Tiler" wordmark in the page header uses the display font with
  intentional weight/spacing, not a plain `<h1>` in body text.

### [x] 3.4 Static build verified deployable to a subpath

Confirm the production build works when served from a non-root path, as
it will be at `apps.charliekrug.com/tiler`.

- `npm run build` output in `dist/` contains only relative asset
  references (no leading `/`), verified by grepping the built HTML/JS for
  `="/`.
- Serving `dist/` from a subpath via a local static server loads the page
  and all assets with no 404s in the console.
