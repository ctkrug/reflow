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

## Planned features

- Four independent tiling engines (BSP, spiral, master-stack, dwindle) that
  each consume the same window list and produce their own layout
- A shared canvas-based interaction surface: add, remove, drag, and resize
  "windows" and see every algorithm's layout update live
- Per-algorithm labeled panes so the four layouts are visually comparable
  side by side
- Smooth transition animation when a layout reflows, so the _reasoning_ of
  each algorithm is visible, not just the end state
- A small control panel: window count, aspect-ratio jitter, and a way to
  step through the layout history

## Stack

- TypeScript, compiled with `tsc`, no framework — the canvas rendering and
  interaction loop don't benefit from a UI framework's overhead
- HTML5 Canvas 2D for rendering
- Vite for local dev/build tooling
- Vitest for unit-testing the tiling algorithms in isolation from rendering

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md),
[`docs/DESIGN.md`](docs/DESIGN.md), and [`docs/BACKLOG.md`](docs/BACKLOG.md)
for the plan.

## Development

```bash
npm install
npm run dev      # start the Vite dev server
npm test         # run the algorithm unit tests
npm run build    # production build into dist/
```

## License

MIT — see [LICENSE](LICENSE).
