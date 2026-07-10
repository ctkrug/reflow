import type { TileRect } from "../types";
import { toPixelRect } from "./layout";
import { theme } from "./theme";

/** A tile rect with an optional render-time opacity, for fading during reflow tweens. */
export type DrawableRect = TileRect & { opacity?: number };

export interface PaneOptions {
  stamp: string;
  count: number;
  /** Id of the window to draw with the cross-pane hover/drag highlight, if any. */
  highlightId?: string | null;
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += theme.gridStep) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += theme.gridStep) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  rect: DrawableRect,
  width: number,
  height: number,
  highlighted: boolean,
): void {
  const px = toPixelRect(rect, width, height);
  const inset = 1.5;

  ctx.save();
  ctx.globalAlpha = rect.opacity ?? 1;
  if (highlighted) {
    ctx.shadowColor = theme.highlightGlow;
    ctx.shadowBlur = 12;
  }

  ctx.fillStyle = highlighted ? theme.highlightFill : theme.rectFill;
  ctx.fillRect(
    px.x + inset,
    px.y + inset,
    px.width - inset * 2,
    px.height - inset * 2,
  );

  ctx.strokeStyle = highlighted ? theme.highlightStroke : theme.rectStroke;
  ctx.lineWidth = highlighted ? 2.5 : 1.5;
  ctx.strokeRect(
    px.x + inset,
    px.y + inset,
    px.width - inset * 2,
    px.height - inset * 2,
  );
  ctx.restore();

  if (px.width > 48 && px.height > 24) {
    ctx.fillStyle = theme.textMuted;
    ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textBaseline = "top";
    ctx.fillText(rect.id, px.x + inset + 4, px.y + inset + 4);
  }
}

function drawEmptyState(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.fillStyle = theme.textMuted;
  ctx.font = "12px 'Inter', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("no windows — add one to begin", width / 2, height / 2);
  ctx.textAlign = "left";
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  options: PaneOptions,
  width: number,
  height: number,
): void {
  const label = `${options.stamp} · ${options.count} WIN`;
  ctx.font = "11px 'JetBrains Mono', ui-monospace, monospace";
  const metrics = ctx.measureText(label);
  const padding = 6;
  const boxWidth = metrics.width + padding * 2;
  const boxHeight = 18;
  const x = width - boxWidth - 6;
  const y = height - boxHeight - 6;

  ctx.fillStyle = theme.surface;
  ctx.fillRect(x, y, boxWidth, boxHeight);
  ctx.strokeStyle = theme.rectStroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, boxWidth - 1, boxHeight - 1);

  ctx.fillStyle = theme.text;
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + padding, y + boxHeight / 2 + 1);
}

/**
 * Renders one algorithm pane: sizes the backing store to devicePixelRatio,
 * draws the blueprint grid, every tile rect, and the corner title-block stamp.
 */
export function renderPane(
  canvas: HTMLCanvasElement,
  rects: DrawableRect[],
  options: PaneOptions,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = theme.surface;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  drawGrid(ctx, cssWidth, cssHeight);
  if (rects.length === 0) {
    drawEmptyState(ctx, cssWidth, cssHeight);
  } else {
    rects.forEach((rect) =>
      drawRect(
        ctx,
        rect,
        cssWidth,
        cssHeight,
        rect.id === options.highlightId,
      ),
    );
  }
  drawStamp(ctx, options, cssWidth, cssHeight);
}
