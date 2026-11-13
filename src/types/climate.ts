export type ClimateRecord = { year: number; anomalyC: number };
export type ClimateDataset = {
  id: string;
  title: string;
  provider: string;
  sourceUrl: string;
  sourceVersion: string;
  referencePeriod: string;
  units: string;
  lastVerified: string;
  retrievedAt: string;
  rawSha256: string;
  originalData: string;
  processingVersion: string;
  records: ClimateRecord[];
};
export type Period = {
  start: number;
  end: number;
  records: ClimateRecord[];
  mean: number;
};

export type MonthlyRecord = ClimateRecord & { month: number };
export type MonthlyDataset = Omit<ClimateDataset, "records"> & {
  records: MonthlyRecord[];
  aggregation: "monthly";
  domain: { min: number; max: number };
};
