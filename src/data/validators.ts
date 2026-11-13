import type {
  ClimateDataset,
  ClimateRecord,
  MonthlyRecord,
} from "../types/climate";
export const SOURCE_URL =
  "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv";
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export type Exclusion = { year: number; reason: string };
const missing = (s: string) => s === "***" || s === "";
function numeric(s: string, row: number): number | null {
  if (missing(s)) return null;
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))
    throw new Error(`Malformed number at row ${row}: ${s}`);
  const n = Number(s);
  if (!Number.isFinite(n) || Math.abs(n) > 10)
    throw new Error(`Implausible anomaly at row ${row}: ${s}`);
  return n;
}
export function parseNASA(
  csv: string,
  asOfYear: number,
): {
  records: ClimateRecord[];
  excluded: Exclusion[];
  monthlyRecords: MonthlyRecord[];
} {
  if (!Number.isInteger(asOfYear) || asOfYear < 1881)
    throw new Error("Invalid as-of year");
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((s) => s.trim());
  const h = lines.findIndex((s) => s.trim().startsWith("Year,"));
  if (h < 0) throw new Error("NASA Year header not found");
  const header = lines[h].split(",").map((s) => s.trim());
  for (const name of ["Year", ...MONTHS, "J-D"]) {
    if (header.filter((x) => x === name).length !== 1)
      throw new Error(`Expected exactly one ${name} column`);
  }
  const monthlyRecords: MonthlyRecord[] = [];
  const records: ClimateRecord[] = [],
    excluded: Exclusion[] = [],
    seen = new Set<number>();
  for (let i = h + 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((s) => s.trim());
    if (cells.length !== header.length)
      throw new Error(`Wrong column count at row ${i + 1}`);
    const yr = cells[header.indexOf("Year")];
    if (!/^\d{4}$/.test(yr)) throw new Error(`Malformed year at row ${i + 1}`);
    const year = Number(yr);
    if (year < 1880) throw new Error(`Year before GISTEMP coverage: ${year}`);
    if (seen.has(year)) throw new Error(`Duplicate year: ${year}`);
    seen.add(year);
    // Validate all values, including excluded rows, so malformed input is never hidden.
    header.forEach((name, j) => {
      if (name !== "Year") numeric(cells[j], i + 1);
    });
    if (year < asOfYear)
      MONTHS.forEach((name, month) => {
        const value = numeric(cells[header.indexOf(name)], i + 1);
        if (value !== null)
          monthlyRecords.push({ year, month: month + 1, anomalyC: value });
      });
    const annual = numeric(cells[header.indexOf("J-D")], i + 1);
    const complete = MONTHS.every((m) => !missing(cells[header.indexOf(m)]));
    if (year >= asOfYear)
      excluded.push({ year, reason: "Current or future calendar year" });
    else if (!complete || annual === null)
      excluded.push({ year, reason: "Incomplete annual record" });
    else records.push({ year, anomalyC: annual });
  }
  records.sort((a, b) => a.year - b.year);
  if (!records.length) throw new Error("No complete annual records");
  monthlyRecords.sort((a, b) => a.year - b.year || a.month - b.month);
  return { records, excluded, monthlyRecords };
}
export function validateRecords(
  records: ClimateRecord[],
  expectedStart = 1880,
) {
  if (!records.length || records[0].year !== expectedStart)
    throw new Error(`Coverage must start in ${expectedStart}`);
  records.forEach((r, i) => {
    if (!Number.isInteger(r.year) || !Number.isFinite(r.anomalyC))
      throw new Error("Invalid climate record");
    if (r.year !== expectedStart + i)
      throw new Error(`Missing, duplicated or unordered year near ${r.year}`);
  });
  if (new Set(records.map((r) => r.anomalyC)).size < 2)
    throw new Error("Degenerate anomaly domain");
}
export function validateDataset(data: ClimateDataset) {
  if (
    data.units !== "°C" ||
    data.referencePeriod !== "1951–1980" ||
    data.sourceVersion !== "GISTEMP v4" ||
    data.sourceUrl !== SOURCE_URL
  )
    throw new Error("Invalid scientific metadata");
  validateRecords(data.records);
  return data;
}
