import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  getAllRecords,
  getRange,
  getYear,
  meanAnomaly,
  comparisonPresets,
  getPreset,
  sourceMetadata,
  firstYear,
  lastYear,
} from "./climate-api";
import { records as loaderRecords, domain } from "./climate-loader";
import { frequency, FREQUENCY_MIN, FREQUENCY_MAX } from "../audio/mappings";

// Independent, deliberately simple reading of the committed raw NASA CSV.
// Expected values in these tests come from this file, never from typed-in numbers.
const raw = readFileSync("data/raw/GLB.Ts+dSST.csv", "utf8");
const lines = raw.split(/\r?\n/).filter((l) => l.trim());
const headerIndex = lines.findIndex((l) => l.startsWith("Year,"));
const header = lines[headerIndex].split(",");
const jd = header.indexOf("J-D");
const rawRows = lines.slice(headerIndex + 1).map((l) => l.split(","));
const rawAnnual = new Map<number, string>(
  rawRows.map((cells) => [Number(cells[0]), cells[jd]]),
);
const rawValue = (year: number) => Number(rawAnnual.get(year));
const rawMean = (start: number, end: number) => {
  let sum = 0;
  for (let y = start; y <= end; y++) sum += rawValue(y);
  return sum / (end - start + 1);
};

describe("climate-api: coverage and completeness", () => {
  const all = getAllRecords();

  it("starts in 1880 and runs every year without gaps", () => {
    expect(firstYear).toBe(1880);
    expect(all[0].year).toBe(1880);
    all.forEach((r, i) => expect(r.year).toBe(1880 + i));
    expect(all).toHaveLength(lastYear - firstYear + 1);
  });

  it("ends at the last complete year in the raw CSV and excludes incomplete years", () => {
    const lastRawRow = rawRows[rawRows.length - 1];
    const lastRawYear = Number(lastRawRow[0]);
    const lastRawIsComplete = !lastRawRow.slice(1, 14).includes("***");
    expect(lastYear).toBe(lastRawIsComplete ? lastRawYear : lastRawYear - 1);
    // Any year whose J-D is "***" must not be present.
    for (const [year, value] of rawAnnual)
      if (value === "***") expect(getYear(year)).toBeUndefined();
  });

  it("has no missing, NaN or non-numeric values", () => {
    all.forEach((r) => {
      expect(Number.isInteger(r.year)).toBe(true);
      expect(Number.isFinite(r.anomalyC)).toBe(true);
      expect(Object.keys(r).sort()).toEqual(["anomalyC", "year"]);
    });
  });

  it("matches every J-D value in the raw CSV for covered years", () => {
    all.forEach((r) => expect(r.anomalyC).toBe(rawValue(r.year)));
  });

  it.each([1880, 1900, 1951, 1980, 1998, 2016, 2020])(
    "spot-check: %i equals the raw CSV J-D value",
    (year) => {
      expect(getYear(year)?.anomalyC).toBe(rawValue(year));
    },
  );
});

describe("climate-api: ranges and means", () => {
  it("returns inclusive ranges", () => {
    const r = getRange(1961, 1990);
    expect(r).toHaveLength(30);
    expect(r[0].year).toBe(1961);
    expect(r.at(-1)!.year).toBe(1990);
  });

  it.each([
    [1870, 1900],
    [2000, 2099],
    [1990, 1961],
    [1961.5, 1990],
  ])("rejects invalid or uncovered range %s–%s", (a, b) => {
    expect(() => getRange(a, b)).toThrow();
  });

  it("computes means from the data, matching an independent raw-CSV calculation", () => {
    for (const [a, b] of [
      [1961, 1990],
      [1991, 2020],
      [1951, 1980],
    ])
      expect(meanAnomaly(a, b)).toBeCloseTo(rawMean(a, b), 10);
  });

  it("1951–1980 base period averages close to zero (sanity check on baseline)", () => {
    // NASA defines anomalies relative to 1951–1980, so this mean should be ~0.
    expect(Math.abs(meanAnomaly(1951, 1980))).toBeLessThan(0.05);
  });
});

describe("climate-api: comparison presets", () => {
  it("includes 1961–1990 vs 1991–2020", () => {
    const p = getPreset("1961-1990_vs_1991-2020");
    expect(p.periods.map((x) => [x.start, x.end])).toEqual([
      [1961, 1990],
      [1991, 2020],
    ]);
  });

  it("1991–2020 mean is higher than 1961–1990 mean", () => {
    expect(meanAnomaly(1991, 2020)).toBeGreaterThan(meanAnomaly(1961, 1990));
    const [early, late] = getPreset("1961-1990_vs_1991-2020").periods;
    expect(late.meanAnomalyC).toBeGreaterThan(early.meanAnomalyC);
  });

  it.each(comparisonPresets.map((p) => [p.id, p] as const))(
    "%s: two complete, non-overlapping 30-year periods with computed means",
    (_id, p) => {
      const [a, b] = p.periods;
      expect(a.end).toBeLessThan(b.start);
      expect(a.records).toHaveLength(30);
      expect(b.records).toHaveLength(30);
      expect(a.meanAnomalyC).toBeCloseTo(rawMean(a.start, a.end), 10);
      expect(b.meanAnomalyC).toBeCloseTo(rawMean(b.start, b.end), 10);
      expect(p.differenceC).toBeCloseTo(b.meanAnomalyC - a.meanAnomalyC, 12);
    },
  );

  it("preset ids are unique and unknown ids throw", () => {
    const ids = comparisonPresets.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(() => getPreset("nope")).toThrow();
  });
});

describe("climate-api: source metadata", () => {
  it("describes the official NASA source, units, base period and coverage", () => {
    expect(sourceMetadata.sourceUrl).toBe(
      "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv",
    );
    expect(sourceMetadata.version).toBe("GISTEMP v4");
    expect(sourceMetadata.units).toBe("°C");
    expect(sourceMetadata.basePeriod).toBe("1951–1980");
    expect(sourceMetadata.coverage).toEqual({
      start: firstYear,
      end: lastYear,
    });
    expect(sourceMetadata.recordCount).toBe(getAllRecords().length);
    expect(Number.isFinite(Date.parse(sourceMetadata.accessedAt))).toBe(true);
    expect(raw.startsWith("Land-Ocean: Global Means")).toBe(true);
  });
});

// Scientific QA: the chart and the sound must describe the same numbers.
// Read-only use of the audio mapping; this test does not change audio code.
describe("climate-api: chart and audio use the same values", () => {
  it("serves the exact same records the UI and audio import from climate-loader", () => {
    expect(getAllRecords()).toBe(loaderRecords);
  });

  it("the shared domain covers every year, so no year is clamped or rejected by the audio mapping", () => {
    const values = getAllRecords().map((r) => r.anomalyC);
    expect(domain.min).toBe(Math.min(...values));
    expect(domain.max).toBe(Math.max(...values));
    getAllRecords().forEach((r) => {
      const hz = frequency(r.anomalyC, domain);
      expect(hz).toBeGreaterThanOrEqual(FREQUENCY_MIN - 1e-9);
      expect(hz).toBeLessThanOrEqual(FREQUENCY_MAX + 1e-9);
    });
  });

  it("warmer years always sound higher (pitch preserves the order of the data)", () => {
    const sorted = [...getAllRecords()].sort((a, b) => a.anomalyC - b.anomalyC);
    for (let i = 1; i < sorted.length; i++)
      expect(frequency(sorted[i].anomalyC, domain)).toBeGreaterThanOrEqual(
        frequency(sorted[i - 1].anomalyC, domain),
      );
  });
});
