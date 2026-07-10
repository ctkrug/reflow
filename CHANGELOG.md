# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-07-10

First public release. Ships as **Reflow** (the project began under the
working title Tiler; the repo slug stays `tiler`).

### Added

- Project scaffold: TypeScript + Vite + Vitest toolchain, ESLint/Prettier,
  CI workflow.
- `docs/VISION.md`, `docs/DESIGN.md`, and `docs/BACKLOG.md` planning docs.
- Four tiling algorithms (BSP, spiral, master-stack, dwindle) rendered
  live side by side in a four-pane comparison grid, fed by one shared
  window list.
- Add/remove windows via toolbar controls, with a live count.
- Drag-to-reorder (mouse and touch) that reflows all four panes at once,
  plus a keyboard-accessible equivalent (arrow keys select, Enter/Space
  picks up and drops, announced via a live region).
- Cross-pane hover/selection highlight, matching a window by id across
  all four panes regardless of input method.
- Tweened reflow/add/remove animation, skipped for
  `prefers-reduced-motion: reduce`.
- The blueprint visual system from `docs/DESIGN.md`: tokens, fonts,
  favicon, and a designed wordmark.
- Subpath-safe production build, verified deployable under a non-root
  path.
