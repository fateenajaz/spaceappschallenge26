import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { eicFrames, eicManifest, monthly, validateMonthly } from "./eic-loader";
import { parseNASA } from "./validators";
import { dataset, domain } from "./climate-loader";
import { frequency } from "../audio/mappings";
describe("documented NASA monthly frame bindings", () => {
  it("reproduces monthly observations from the authentic retained CSV", () => {
    const parsed = parseNASA(
      readFileSync("data/raw/GLB.Ts+dSST.csv", "utf8"),
      2026,
    );
    expect(parsed.monthlyRecords).toEqual(monthly.records);
    expect(monthly.rawSha256).toBe(dataset.rawSha256);
    expect(monthly.records).toHaveLength(dataset.records.length * 12);
    expect(monthly.domain).toEqual({
      min: Math.min(...monthly.records.map((r) => r.anomalyC)),
      max: Math.max(...monthly.records.map((r) => r.anomalyC)),
    });
  });
  it("binds explicit dates, baseline, evidence and actual image bytes", () => {
    expect(eicFrames.map((f) => [f.year, f.month])).toEqual([
      [2023, 7],
      [2023, 8],
      [2024, 5],
    ]);
    expect(eicManifest.referencePeriod).toBe("1951–1980");
    for (const frame of eicFrames) {
      expect(
        createHash("sha256")
          .update(readFileSync("public" + frame.image))
          .digest("hex"),
      ).toBe(frame.sha256);
      expect(frame.record).toEqual(
        monthly.records.find(
          (r) => r.year === frame.year && r.month === frame.month,
        ),
      );
      expect(frame.evidence.length).toBeGreaterThan(50);
      expect(frame.sourceUrl).toMatch(/^https:\/\/svs.gsfc.nasa.gov\//);
    }
  });
  it("uses the complete monthly domain rather than rescaling the three selected dates", () => {
    expect(monthly.domain.max).toBeGreaterThan(
      Math.max(...eicFrames.map((f) => f.record.anomalyC)),
    );
    eicFrames.forEach((f) =>
      expect(frequency(f.record.anomalyC, monthly.domain)).toBeGreaterThan(220),
    );
    expect(domain).toEqual({ min: -0.48, max: 1.28 });
  });
  it("rejects missing months and an altered mapping domain", () => {
    expect(() =>
      validateMonthly({
        ...monthly,
        records: monthly.records.filter((_, i) => i !== 5),
      }),
    ).toThrow("coverage");
    expect(() =>
      validateMonthly({ ...monthly, domain: { min: 0, max: 1 } }),
    ).toThrow("domain");
  });
});
