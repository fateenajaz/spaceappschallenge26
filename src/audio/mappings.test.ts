import { describe, it, expect } from "vitest";
import { frequency, normalize } from "./mappings";
import { domain, records, presets } from "../data/climate-loader";
describe("shared scientific mapping", () => {
  it("maps endpoints to 220 and 660 Hz and is deterministic", () => {
    expect(frequency(domain.min, domain)).toBe(220);
    expect(frequency(domain.max, domain)).toBe(660);
    records.forEach((r) =>
      expect(frequency(r.anomalyC, domain)).toBe(frequency(r.anomalyC, domain)),
    );
  });
  it("is strictly monotonic with equal ratios for equal anomaly increments", () => {
    const values = [...new Set(records.map((r) => r.anomalyC))].sort(
      (a, b) => a - b,
    );
    for (let i = 1; i < values.length; i++)
      expect(frequency(values[i], domain)).toBeGreaterThan(
        frequency(values[i - 1], domain),
      );
    expect(frequency(0.2, domain) / frequency(0.1, domain)).toBeCloseTo(
      frequency(0.1, domain) / frequency(0, domain),
    );
  });
  it("uses the same global domain for all comparison periods", () => {
    presets
      .flatMap((p) => p.periods)
      .forEach((p) =>
        p.records.forEach((r) =>
          expect(frequency(r.anomalyC, domain)).toBe(
            frequency(records.find((v) => v.year === r.year)!.anomalyC, domain),
          ),
        ),
      );
  });
  it("explicitly rejects out-of-domain and invalid inputs", () => {
    for (const value of [domain.min - 0.01, domain.max + 0.01, NaN, Infinity])
      expect(() => frequency(value, domain)).toThrow();
    expect(() => normalize(0, { min: 0, max: 0 })).toThrow();
  });
});
