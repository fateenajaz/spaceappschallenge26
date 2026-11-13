/** Artistic translation of raster pixels, never a reconstruction of climate measurements. */
export const SCORE_COLUMNS = 64;
export const SCORE_BANDS = 8;
export const COLUMN_SECONDS = 0.22;
export type PixelBand = { warm: number; cool: number };
export type FrameScore = {
  columns: PixelBand[][];
  width: number;
  height: number;
  retainedPixels: number;
};
export function analyzeFrame(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
): FrameScore {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < SCORE_COLUMNS ||
    height < SCORE_BANDS ||
    rgba.length !== width * height * 4
  )
    throw new Error(
      "The NASA image could not be analyzed at the required resolution.",
    );
  const columns = Array.from({ length: SCORE_COLUMNS }, () =>
    Array.from({ length: SCORE_BANDS }, () => ({ warm: 0, cool: 0 })),
  );
  const totals = columns.map(() => Array(SCORE_BANDS).fill(0));
  let retainedPixels = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const r = rgba[offset],
        g = rgba[offset + 1],
        b = rgba[offset + 2];
      const column = Math.min(
        SCORE_COLUMNS - 1,
        Math.floor((x / width) * SCORE_COLUMNS),
      );
      const band = Math.min(
        SCORE_BANDS - 1,
        Math.floor((y / height) * SCORE_BANDS),
      );
      totals[column][band]++;
      // Suppress neutral pixels, yellow/green guides and dark JPEG background noise.
      if (
        rgba[offset + 3] < 128 ||
        Math.max(r, g, b) < 45 ||
        Math.max(r, g, b) - Math.min(r, g, b) < 25
      )
        continue;
      if (r > g * 1.12 && r > b * 1.08) {
        columns[column][band].warm++;
        retainedPixels++;
      } else if (b > r * 1.12 && b > g * 1.02) {
        columns[column][band].cool++;
        retainedPixels++;
      }
    }
  columns.forEach((column, x) =>
    column.forEach((band, y) => {
      band.warm /= totals[x][y];
      band.cool /= totals[x][y];
    }),
  );
  if (!retainedPixels)
    throw new Error(
      "No red/blue image features were detected. No substitute score was generated.",
    );
  return { columns, width, height, retainedPixels };
}
// A descending pentatonic voicing gives higher image positions higher pitches.
export const BAND_FREQUENCIES = [
  659.255, 587.33, 493.883, 440, 391.995, 329.628, 293.665, 246.942,
];
