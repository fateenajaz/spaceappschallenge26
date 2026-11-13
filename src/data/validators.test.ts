import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { parseNASA, validateDataset, validateRecords } from "./validators";
import {
  dataset,
  records,
  mean,
  period,
  createAttempt,
  presets,
} from "./climate-loader";
// Synthetic parser fixtures only. Product observations always come from retained NASA CSV.
const header = "Year,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,J-D,D-N";
const row = (year: number, annual = "0.12", month = "0.10") =>
  `${year},${Array(12).fill(month).join(",")},${annual},0.99`;
const csv = (...rows: string[]) =>
  `Land-Ocean: Global Means\n${header}\n${rows.join("\n")}`;
describe("NASA annual parser", () => {
  it("selects J-D by name, preserves Celsius decimals and sorts years", () => {
    const { records } = parseNASA(
      csv(row(1881, "-.09"), row(1880, "-.18")),
      2026,
    );
    expect(records).toEqual([
      { year: 1880, anomalyC: -0.18 },
      { year: 1881, anomalyC: -0.09 },
    ]);
  });
  it("reports incomplete rows and excludes current or future years even when annual value exists", () => {
    const result = parseNASA(
      csv(
        row(1880),
        row(1881, "***"),
        row(1882, ".2", "***"),
        row(2026),
        row(2027),
      ),
      2026,
    );
    expect(result.records).toHaveLength(1);
    expect(result.excluded.map((r) => r.year)).toEqual([
      1881, 1882, 2026, 2027,
    ]);
  });
  it.each(["duplicate", "malformed", "header", "columns"])(
    "rejects %s data",
    (kind) => {
      const input =
        kind === "duplicate"
          ? csv(row(1880), row(1880))
          : kind === "malformed"
            ? csv(row(1880, "abc"))
            : kind === "header"
              ? csv(row(1880)).replace("J-D", "annual")
              : csv(row(1880)) + ",extra";
      expect(() => parseNASA(input, 2026)).toThrow();
    },
  );
  it("rejects gaps and invalid metadata", () => {
    expect(() =>
      validateRecords([
        { year: 1880, anomalyC: 0 },
        { year: 1882, anomalyC: 1 },
      ]),
    ).toThrow();
    expect(() => validateDataset({ ...dataset, units: "hundredths" })).toThrow(
      "metadata",
    );
    expect(() =>
      validateDataset({ ...dataset, referencePeriod: "1900–1930" }),
    ).toThrow("metadata");
  });
  it("reproduces every shipped observation and authenticates raw bytes", () => {
    const raw = readFileSync("data/raw/GLB.Ts+dSST.csv");
    expect(createHash("sha256").update(raw).digest("hex")).toBe(
      dataset.rawSha256,
    );
    expect(parseNASA(raw.toString(), 2026).records).toEqual(records);
    expect(records[0].year).toBe(1880);
    expect(records.at(-1)!.year).toBe(2025);
  });
  it("computes means and enforces complete, non-overlapping periods", () => {
    expect(
      mean([
        { year: 1, anomalyC: -0.2 },
        { year: 2, anomalyC: 0.4 },
      ]),
    ).toBeCloseTo(0.1);
    expect(() => mean([])).toThrow();
    expect(() => period(1800, 1830)).toThrow();
    presets.forEach((p) => {
      expect(p.periods[0].end).toBeLessThan(p.periods[1].start);
      p.periods.forEach((x) => expect(x.records).toHaveLength(30));
    });
    const a = createAttempt(0, () => 0),
      b = createAttempt(0, () => 1);
    expect(a.A).toEqual(b.B);
    expect(a.B).toEqual(b.A);
  });
});
