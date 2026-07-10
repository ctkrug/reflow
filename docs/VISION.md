# Vision — Reflow

## The problem

Tiling window managers (i3, dwm, Hyprland, xmonad, bspwm...) each ship a
different layout algorithm, and the differences matter — they change how
your screen feels to use every day. But you can't compare them without
installing four window managers and switching between them, or reading
descriptions like "BSP recursively splits the largest region" that don't
actually show you what that looks like in motion, especially as you add,
remove, and drag windows around.

## Who it's for

People who already use or are curious about tiling window managers —
Linux/BSD desktop tinkerers, terminal-first developers, the r/unixporn
crowd — plus anyone learning computational geometry/layout algorithms who
wants to _see_ BSP, spiral, master-stack, and dwindle tiling behave instead
of reading pseudocode.

## The core idea

One canvas, four synchronized panes. The same window list (add, remove,
drag) drives four independent tiling algorithms rendered side by side, so
the differences in behavior are visible in the same instant instead of
recalled from memory or a screen recording. Dragging a window is the
comparison mechanism: drop it in a corner and watch BSP split one way,
spiral wind the other, master-stack barely move, and dwindle halve
recursively.

## Key design decisions

- **Four algorithms, one shared window list.** All four panes consume the
  exact same `TileWindow[]` state — no pane can drift out of sync with
  what the user actually did.
- **Pure functions for the algorithms.** Each tiling algorithm is a pure
  `(windows) => rects` function with no DOM/canvas dependency, so it can be
  unit-tested in isolation (see `docs/BACKLOG.md`) and the rendering layer
  stays a thin consumer.
- **Normalized coordinates.** Windows and rects live in `[0, 1]` space, not
  pixels, so every pane (and any future export/resize) can scale
  independently from the underlying geometry.
- **No server, no persistence.** Reflow is a single static page — all state
  lives in memory for the session. Nothing to install, nothing to save;
  drop windows and explore.
- **Blueprint visual language** (see `docs/DESIGN.md`) reinforces that this
  is a precision comparison tool, not a game — cyan linework, grid paper,
  drafted title-block labels per pane.

## What "v1 done" looks like

- All four algorithms (BSP, spiral, master-stack, dwindle) are implemented
  as pure, individually unit-tested functions and correctly re-tile on
  every add/remove/drag.
- The four-pane comparison grid renders live at desktop and phone widths,
  following `docs/DESIGN.md`'s direction and tokens.
- A user can add windows (at least up to 8–10), drag any window to a new
  position/size, and remove a window, and all four panes reflow within a
  single animated frame of each other.
- The build is a static, self-contained site (relative asset paths, single
  `dist/` output) deployable to `apps.charliekrug.com/tiler` with no
  server.
- CI is green: typecheck, unit tests for all four algorithms, and a
  production build all pass on every push.
