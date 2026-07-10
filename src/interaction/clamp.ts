/** Clamps a value into the normalized [0, 1] tiling coordinate space. */
export function clampUnit(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
