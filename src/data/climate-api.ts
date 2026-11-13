/**
 * ECHO EARTH data API: one small, documented entry point for UI and audio code.
 *
 * Every value here comes from the validated NASA GISTEMP v4 snapshot loaded by
 * `climate-loader.ts` (which is generated from the committed raw CSV by
 * `scripts/prepare-climate-data.ts`). Nothing in this file contains NASA numbers:
 * coverage, means and differences are all computed from the records at runtime.
 *
 * Anomalies are in °C relative to NASA's 1951–1980 base period. They are not
 * absolute temperatures, and they are not rebased here.
 */
import { dataset, records, mean } from "./climate-loader";
import type { ClimateRecord } from "../types/climate";

export type { ClimateRecord } from "../types/climate";

/** Inclusive span of calendar years, e.g. { start: 1961, end: 1990 }. */
export type YearSpan = { start: number; end: number };

export type ComparisonPeriod = YearSpan & {
  label: string;
  records: ClimateRecord[];
  meanAnomalyC: number;
};

export type ComparisonPreset = {
  id: string;
  label: string;
  /** Always ordered earlier period first; shuffle for blind A/B in the UI. */
  periods: [ComparisonPeriod, ComparisonPeriod];
  /** later mean minus earlier mean, in °C (computed, never hardcoded). */
  differenceC: number;
};

export type SourceMetadata = {
  datasetName: string;
  provider: string;
  version: string;
  sourceUrl: string;
  infoUrl: string;
  units: string;
  basePeriod: string;
  annualColumn: string;
  coverage: YearSpan;
  recordCount: number;
  accessedAt: string;
  rawSha256: string;
  rawCsvPath: string;
};

/** All complete annual records (Jan–Dec mean, J-D column), oldest first. */
export function getAllRecords(): readonly ClimateRecord[] {
  return records;
}

export const firstYear = records[0].year;
export const lastYear = records[records.length - 1].year;

/**
 * Records for an inclusive year range. Throws if the range is invalid or not
 * fully covered by complete NASA annual records, so callers never silently get
 * a shorter period than they asked for.
 */
export function getRange(start: number, end: number): ClimateRecord[] {
  if (!Number.isInteger(start) || !Number.isInteger(end))
    throw new Error(`Years must be whole numbers: ${start}–${end}`);
  if (end < start)
    throw new Error(`Range ends before it starts: ${start}–${end}`);
  if (start < firstYear || end > lastYear)
    throw new Error(
      `Range ${start}–${end} is outside NASA coverage ${firstYear}–${lastYear}`,
    );
  const selected = records.filter((r) => r.year >= start && r.year <= end);
  if (selected.length !== end - start + 1)
    throw new Error(`Range ${start}–${end} has missing years`);
  return selected;
}

/** Mean annual anomaly (°C vs 1951–1980) for an inclusive year range. */
export function meanAnomaly(start: number, end: number): number {
  return mean(getRange(start, end));
}

/** Look up a single year; undefined if it is not a complete NASA annual record. */
export function getYear(year: number): ClimateRecord | undefined {
  return records.find((r) => r.year === year);
}

function comparisonPeriod(start: number, end: number): ComparisonPeriod {
  const selected = getRange(start, end);
  return {
    start,
    end,
    label: `${start}–${end}`,
    records: selected,
    meanAnomalyC: mean(selected),
  };
}

function preset(
  id: string,
  label: string,
  earlier: YearSpan,
  later: YearSpan,
): ComparisonPreset {
  if (earlier.end >= later.start)
    throw new Error(`Preset ${id}: periods overlap or are out of order`);
  const a = comparisonPeriod(earlier.start, earlier.end);
  const b = comparisonPeriod(later.start, later.end);
  if (a.records.length !== 30 || b.records.length !== 30)
    throw new Error(`Preset ${id}: periods must be 30 years each`);
  return {
    id,
    label,
    periods: [a, b],
    differenceC: b.meanAnomalyC - a.meanAnomalyC,
  };
}

/** Non-overlapping 30-year comparison pairs for the listening test. */
export const comparisonPresets: readonly ComparisonPreset[] = [
  preset(
    "1961-1990_vs_1991-2020",
    "Two recent climate normals",
    { start: 1961, end: 1990 },
    { start: 1991, end: 2020 },
  ),
  preset(
    "1931-1960_vs_1991-2020",
    "Mid-century vs recent",
    { start: 1931, end: 1960 },
    { start: 1991, end: 2020 },
  ),
  preset(
    "1901-1930_vs_1991-2020",
    "Early 20th century vs recent",
    { start: 1901, end: 1930 },
    { start: 1991, end: 2020 },
  ),
];

export function getPreset(id: string): ComparisonPreset {
  const found = comparisonPresets.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown comparison preset: ${id}`);
  return found;
}

/** Everything the "About the data" / sources section needs to display. */
export const sourceMetadata: SourceMetadata = Object.freeze({
  datasetName: `${dataset.sourceVersion} ${dataset.title}`,
  provider: "NASA Goddard Institute for Space Studies (GISS)",
  version: dataset.sourceVersion,
  sourceUrl: dataset.sourceUrl,
  infoUrl: "https://data.giss.nasa.gov/gistemp/",
  units: dataset.units,
  basePeriod: dataset.referencePeriod,
  annualColumn: "J-D (January–December mean)",
  coverage: Object.freeze({ start: firstYear, end: lastYear }),
  recordCount: records.length,
  accessedAt: dataset.retrievedAt,
  rawSha256: dataset.rawSha256,
  rawCsvPath: "data/raw/GLB.Ts+dSST.csv",
});
