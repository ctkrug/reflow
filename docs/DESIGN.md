# Design — Reflow

## 1. Aesthetic direction

**Blueprint/technical.** Reflow is a tool for people who already love tiling
window managers — a keyboard-driven, dotfiles-tinkering, "I rice my i3
config" audience. The UI reads like an architectural blueprint: fine grid
paper, cyan linework on a near-black ground, rectangles annotated with their
coordinates, corner tick marks like a drafting tool. It should feel like
you're looking at the _schematic_ of a window layout, not a toy.

One sentence: _Reflow is a blueprint — cyan linework and grid paper on a
near-black sheet, every window rectangle labeled like a drafted plan._

## 2. Tokens

| Token              | Value                      | Use                                     |
| ------------------ | -------------------------- | --------------------------------------- |
| `--bg`             | `#0a0e12`                  | page background                         |
| `--surface-1`      | `#0f151b`                  | panel background (each algorithm pane)  |
| `--surface-2`      | `#141c24`                  | raised surface (toolbar, cards)         |
| `--text`           | `#dce8ec`                  | primary text                            |
| `--text-muted`     | `#6f8894`                  | secondary/labels                        |
| `--accent`         | `#3fd0e0`                  | cyan — active lines, primary actions    |
| `--accent-support` | `#e0a53f`                  | amber — highlight/selection, drag state |
| `--success`        | `#4fd68c`                  | valid state                             |
| `--danger`         | `#e0623f`                  | invalid/error state                     |
| `--grid-line`      | `rgba(63, 208, 224, 0.08)` | blueprint grid overlay                  |

**Type pairing:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
for the wordmark, labels, and coordinates (technical, monospace, matches the
"drafted schematic" feel) paired with [Inter](https://fonts.google.com/specimen/Inter)
for body copy and UI chrome (readable at small sizes, neutral). System
fallback stack: `"JetBrains Mono", ui-monospace, monospace` and
`Inter, system-ui, sans-serif`.

**Spacing:** 4px base unit (4/8/12/16/24/32/48).

**Corner radius:** 2px on panels (drafted, not soft); 1px on window
rectangles inside the canvas — blueprints don't round corners.

**Shadow/glow:** no drop shadows. Depth comes from a 1px `--accent` border
at low opacity plus an inset grid, like linework on paper. Selected/dragged
windows get a soft cyan glow (`box-shadow: 0 0 12px rgba(63,208,224,0.35)`)
to read as "live" against the flat blueprint background.

**Motion:** UI chrome transitions 150ms ease-out. Layout reflow (a window
moving to its new tiled position) animates 100–140ms ease-out per algorithm
pane — fast enough that four panes reflowing together still reads as one
simultaneous event, not a stagger.

## 3. Layout intent

The hero is the **four-pane comparison grid** — one canvas per algorithm
(BSP, spiral, master-stack, dwindle), each labeled, all four visible at
once and reflowing in lockstep as the user drags.

- **Desktop (1440×900):** a 2×2 grid of algorithm panes fills the viewport
  below a slim top toolbar (add window / clear / algorithm legend). The
  grid is the majority of the screen — panes have no wasted margin, and
  the grid lines run edge-to-edge inside each pane.
- **Phone (390×844):** panes stack vertically, one full-width pane at a
  time with a swipeable/scrollable list and a sticky mini-legend; each pane
  keeps a 1:1-ish aspect so the layouts still read clearly at small size.

## 4. Signature detail

Each algorithm pane has a **drafted corner stamp** — a small monospace
label in the corner (`BSP·01`, `SPIRAL·02`, `MASTER·03`, `DWINDLE·04`) plus
a live rectangle count, styled like a blueprint's title block. The four
stamps sharing one numbering scheme is what ties the four independent
canvases into one coherent "sheet."

## 5. Juice plan (interaction feedback, not a game but still needs feel)

- **Drag tween:** picking up a window gives it the cyan glow instantly
  (<16ms). Dropping it triggers every pane's layout to re-tile with a
  100–140ms ease-out tween on every rectangle that moved.
- **Add/remove feedback:** a new window rectangle scales in from 80%→100%
  opacity+scale over 120ms; removing one fades+shrinks over 100ms before
  the remaining rectangles tween into their new slots.
- **Selection feedback:** hovering a window rectangle in any pane
  highlights the _same window id_ across all four panes simultaneously
  (thin amber outline) — this is the comparison payoff, made visible.
- No sound is planned for v1 (Reflow is a precision tool, not a toy) — skip
  the synth SFX list; if a future pass adds audio it must follow the same
  synthesized-WebAudio + mute-toggle rule as any other project.
