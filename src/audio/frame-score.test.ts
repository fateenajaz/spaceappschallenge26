import { describe, it, expect } from "vitest";
import { analyzeFrame, SCORE_COLUMNS, SCORE_BANDS } from "./frame-score";
describe("NASA raster translation", () => {
  it("retains actual red/blue fractions while excluding neutral and guide colors", () => {
    const pixels = new Uint8ClampedArray(SCORE_COLUMNS * SCORE_BANDS * 4);
    const write = (x: number, color: number[]) =>
      pixels.set([...color, 255], x * 4);
    write(0, [220, 40, 50]);
    write(1, [30, 100, 220]);
    write(2, [255, 255, 0]);
    write(3, [0, 255, 0]);
    write(4, [200, 200, 200]);
    write(5, [5, 2, 1]);
    const score = analyzeFrame(pixels, SCORE_COLUMNS, SCORE_BANDS);
    expect(score.retainedPixels).toBe(2);
    expect(score.columns[0][0]).toEqual({ warm: 1, cool: 0 });
    expect(score.columns[1][0]).toEqual({ warm: 0, cool: 1 });
    expect(score.columns[2][0]).toEqual({ warm: 0, cool: 0 });
    expect(score.columns[0][1]).toEqual({ warm: 0, cool: 0 });
  });
  it("fails instead of substituting a score for invalid or blank images", () => {
    expect(() => analyzeFrame([], 64, 8)).toThrow();
    expect(() => analyzeFrame(new Uint8Array(64 * 8 * 4), 64, 8)).toThrow(
      /No red\/blue/,
    );
  });
});
