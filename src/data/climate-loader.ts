import snapshot from "./climate.json";
import { validateDataset } from "./validators";
import type { ClimateDataset, ClimateRecord, Period } from "../types/climate";
export const dataset = validateDataset(snapshot as ClimateDataset);
export const records = dataset.records;
export const domain = {
  min: Math.min(...records.map((r) => r.anomalyC)),
  max: Math.max(...records.map((r) => r.anomalyC)),
};
export function mean(values: ClimateRecord[]) {
  if (!values.length) throw new Error("Cannot average empty records");
  return values.reduce((sum, r) => sum + r.anomalyC, 0) / values.length;
}
export function period(start: number, end: number): Period {
  const selected = records.filter((r) => r.year >= start && r.year <= end);
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    end < start ||
    selected.length !== end - start + 1
  )
    throw new Error("Incomplete comparison period");
  return { start, end, records: selected, mean: mean(selected) };
}
export const presets = [
  {
    label: "Two recent climate periods",
    periods: [period(1961, 1990), period(1991, 2020)],
  },
  {
    label: "Early and recent observations",
    periods: [period(1881, 1910), period(1991, 2020)],
  },
];
export function createAttempt(preset = 0, random = Math.random) {
  const pair = presets[preset].periods;
  if (pair[0].end >= pair[1].start)
    throw new Error("Comparison periods must not overlap");
  return random() < 0.5
    ? { A: pair[0], B: pair[1] }
    : { A: pair[1], B: pair[0] };
}
export const signed = (n: number, digits = 2) =>
  `${n > 0 ? "+" : ""}${n.toFixed(digits)}`;
