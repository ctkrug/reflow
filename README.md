# Tiler

[![CI](https://github.com/ctkrug/tiler/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/tiler/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Drag windows onto a canvas and watch four tiling-window-manager algorithms —
**BSP**, **spiral**, **master-stack**, and **dwindle** — reflow them live,
side by side, in real time.

## Why

Tiling window managers (i3, dwm, Hyprland, xmonad...) each implement a
different layout algorithm, but you never actually _see_ them compared
against each other — you read a paragraph describing "spiral" placement or
you watch a screen recording of one WM at a time. Tiler puts four
implementations on screen simultaneously, fed by the same input, so you can
drag a window and watch BSP split one way while spiral winds the other and
master-stack just resizes a stack. It's the only place to see and compare
tiling algorithms behave instead of reading about them.

## The wow moment

Drop five rectangles onto the canvas and watch all four algorithms lay them
out simultaneously as you add, remove, and drag windows around.

## Features

- Four independent tiling engines (BSP, spiral, master-stack, dwindle),
  each a pure function that consumes the same window list and produces its
  own layout
- A shared window list: add or remove a window and all four panes re-tile
  from the same state within one animation frame
- Per-algorithm labeled panes with a live rect count, styled as a
  blueprint's corner title-block stamp
- Responsive 2×2 grid on desktop that stacks to one column on phone
- Drag a window in any pane onto another to reorder it, reflowing all four
  panes live — works with mouse or touch
- Cross-pane highlight: hovering (or dragging) a window in one pane
  highlights the same window everywhere else
- Tweened reflow/add/remove animation (ease-out, ~100-140ms), skipped
  entirely for `prefers-reduced-motion: reduce`

## Stack

- TypeScript, compiled with `tsc`, no framework — the canvas rendering and
  interaction loop don't benefit from a UI framework's overhead
- HTML5 Canvas 2D for rendering
- Vite for local dev/build tooling
- Vitest for unit-testing the tiling algorithms in isolation from rendering

## Status

The full comparison engine is live: `npm run dev` opens straight into the
four-pane grid, seeded with windows, ready to add, remove, drag-to-reorder,
and hover-highlight across all four panes at once. See
[`docs/VISION.md`](docs/VISION.md), [`docs/DESIGN.md`](docs/DESIGN.md),
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the plan and what's left.

## Development

```bash
npm install
npm run dev      # start the Vite dev server
npm test         # run the algorithm unit tests
npm run build    # production build into dist/
```

## License

MIT — see [LICENSE](LICENSE).
