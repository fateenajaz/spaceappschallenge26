import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { parseNASA, SOURCE_URL, validateDataset } from "../src/data/validators";
import type { ClimateDataset } from "../src/types/climate";
const { values } = parseArgs({
  options: {
    input: { type: "string" },
    "retrieved-at": { type: "string" },
    "as-of-year": { type: "string" },
  },
});
const retrievedAt = values["retrieved-at"] ?? new Date().toISOString();
if (!Number.isFinite(Date.parse(retrievedAt)))
  throw new Error("Invalid retrieval timestamp");
const asOfYear = Number(
  values["as-of-year"] ?? new Date(retrievedAt).getUTCFullYear(),
);
const bytes = values.input
  ? await readFile(values.input)
  : execFileSync("curl", [
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      "--max-time",
      "60",
      SOURCE_URL,
    ]);
const rawSha256 = createHash("sha256").update(bytes).digest("hex");
const { records, excluded, monthlyRecords } = parseNASA(
  bytes.toString("utf8"),
  asOfYear,
);
const dataset: ClimateDataset = {
  id: `gistemp-v4-${rawSha256.slice(0, 12)}`,
  title: "Global Land–Ocean Temperature Index",
  provider: "NASA GISS",
  sourceUrl: SOURCE_URL,
  sourceVersion: "GISTEMP v4",
  referencePeriod: "1951–1980",
  units: "°C",
  lastVerified: retrievedAt.slice(0, 10),
  retrievedAt,
  rawSha256,
  originalData: `/data/GLB.Ts+dSST-${rawSha256.slice(0, 12)}.csv`,
  processingVersion: "1.1.0",
  records,
};
validateDataset(dataset);
if (
  monthlyRecords.length !== records.length * 12 ||
  monthlyRecords.some((r, i) => r.year * 12 + r.month - 1 !== 1880 * 12 + i)
)
  throw new Error("Monthly coverage is incomplete or non-contiguous");
const monthly = {
  ...dataset,
  id: `gistemp-v4-monthly-${rawSha256.slice(0, 12)}`,
  title: "Monthly Global Land–Ocean Temperature Index",
  aggregation: "monthly",
  domain: {
    min: Math.min(...monthlyRecords.map((r) => r.anomalyC)),
    max: Math.max(...monthlyRecords.map((r) => r.anomalyC)),
  },
  records: monthlyRecords,
};

for (const [start, end] of [
  [1961, 1990],
  [1991, 2020],
]) {
  if (records.filter((r) => r.year >= start && r.year <= end).length !== 30)
    throw new Error(`Incomplete comparison ${start}–${end}`);
}
const report = {
  status: "passed",
  sourceUrl: SOURCE_URL,
  rawSha256,
  retrievedAt,
  asOfYear,
  processingVersion: "1.1.0",
  rowCount: records.length,
  firstYear: records[0].year,
  lastYear: records.at(-1)!.year,
  units: "°C",
  referencePeriod: "1951–1980",
  domain: [
    Math.min(...records.map((r) => r.anomalyC)),
    Math.max(...records.map((r) => r.anomalyC)),
  ],
  monthlyRowCount: monthlyRecords.length,
  monthlyDomain: monthly.domain,
  excluded,
  checks: [
    "Header by name",
    "All numeric cells validated",
    "No duplicate years",
    "Complete months and J-D",
    "Past calendar years only",
    "Contiguous coverage from 1880",
    "Celsius values preserved",
    "Two complete non-overlapping 30-year periods",
  ],
};
await mkdir("public/data", { recursive: true });
await writeFile(`public${dataset.originalData}`, bytes);
await writeFile(
  "src/data/climate.json",
  JSON.stringify(dataset, null, 2) + "\n",
);
await writeFile(
  "public/data/validation-report.json",
  JSON.stringify(report, null, 2) + "\n",
);
await copyFile("src/data/climate.json", "public/data/climate.json");
console.log(JSON.stringify(report, null, 2));

await writeFile(
  "src/data/monthly.json",
  JSON.stringify(monthly, null, 2) + "\n",
);
await writeFile(
  "public/data/monthly.json",
  JSON.stringify(monthly, null, 2) + "\n",
);
