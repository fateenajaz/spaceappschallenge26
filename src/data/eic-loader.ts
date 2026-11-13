import monthlySnapshot from "./monthly.json";
import frameSnapshot from "./eic-frames.json";
import type { MonthlyDataset, MonthlyRecord } from "../types/climate";
export const monthly = monthlySnapshot as MonthlyDataset;
export const eicManifest = frameSnapshot;
export function validateMonthly(data: MonthlyDataset) {
  if (
    data.units !== "°C" ||
    data.referencePeriod !== "1951–1980" ||
    data.aggregation !== "monthly" ||
    !data.records.length
  )
    throw new Error("Invalid monthly metadata");
  data.records.forEach((r, i) => {
    if (
      !Number.isFinite(r.anomalyC) ||
      r.year * 12 + r.month - 1 !== 1880 * 12 + i ||
      r.month < 1 ||
      r.month > 12
    )
      throw new Error("Invalid monthly coverage");
  });
  if (
    data.domain.min !== Math.min(...data.records.map((r) => r.anomalyC)) ||
    data.domain.max !== Math.max(...data.records.map((r) => r.anomalyC))
  )
    throw new Error("Monthly mapping domain does not match observations");
}
validateMonthly(monthly);
export const eicFrames = eicManifest.frames.map((frame) => {
  const record = monthly.records.find(
    (r) => r.year === frame.year && r.month === frame.month,
  );
  if (
    !record ||
    eicManifest.referencePeriod !== monthly.referencePeriod ||
    !frame.evidence ||
    !frame.sourceUrl.startsWith("https://svs.gsfc.nasa.gov/")
  )
    throw new Error("Unverified NASA frame binding");
  return { ...frame, record };
});
export const eicRecords: MonthlyRecord[] = eicFrames.map((f) => f.record);
export const monthLabel = (record: Pick<MonthlyRecord, "year" | "month">) =>
  `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][record.month - 1]} ${record.year}`;
