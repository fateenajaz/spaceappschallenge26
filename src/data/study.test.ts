import { describe, it, expect } from "vitest";
import {
  readStudies,
  STUDY_KEY,
  summarizeStudies,
  exportStudies,
  validateStudy,
} from "./study";
import { DEMO_SECONDS, demoStages, clockLabel } from "./presentation";
import type { StudyRecord } from "../types/study";
// Synthetic fixtures used only in tests, never seeded into product storage or reports.
const sample: StudyRecord = {
  version: 1,
  id: "synthetic-test-only",
  createdAt: "2026-11-12T18:00:00Z",
  datasetId: "test-fixture",
  protocolVersion: "1.0.0",
  pre: { anomaly: "unsure", pitch: "volume" },
  post: { anomaly: "baseline", pitch: "warmer" },
  listening: {
    answer: "uncertain",
    correct: null,
    periods: {
      A: { start: 1961, end: 1990, mean: 0.1 },
      B: { start: 1991, end: 2020, mean: 0.6 },
    },
    completedSequences: { A: false, B: false },
    elapsedSeconds: 20,
  },
  helpfulness: "unsure",
  device: "no-audio",
  observerNotes: "Synthetic test observation",
};
describe("honest local study reporting", () => {
  it("starts with zero results and does not invent percentages", () => {
    expect(readStudies({ getItem: () => null })).toEqual([]);
    expect(summarizeStudies([])).toMatchObject({
      sessions: 0,
      preCorrect: 0,
      postCorrect: 0,
      questionResponses: 0,
    });
  });
  it("preserves raw responses, uncertainty, source revision and descriptive denominators", () => {
    expect(validateStudy(sample)).toBe(true);
    const parsed = readStudies({
      getItem: (key) => {
        expect(key).toBe(STUDY_KEY);
        return JSON.stringify([sample]);
      },
    });
    expect(parsed).toEqual([sample]);
    const report = exportStudies(parsed);
    expect(report.summary).toMatchObject({
      sessions: 1,
      preCorrect: 0,
      postCorrect: 2,
      questionResponses: 2,
      uncertain: 1,
      correctComparisons: 0,
      completedBoth: 0,
    });
    expect(report.records[0]).toEqual(sample);
    expect(report.limitations).toContain("no control group");
  });
  it("rejects corrupt, duplicate and malformed saved results rather than overwriting them", () => {
    for (const raw of [
      "oops",
      "{}",
      JSON.stringify([
        { ...sample, post: { anomaly: "fake", pitch: "warmer" } },
      ]),
      JSON.stringify([sample, sample]),
    ])
      expect(() => readStudies({ getItem: () => raw })).toThrow();
    expect(() =>
      exportStudies([{ ...sample, version: 99 } as unknown as StudyRecord]),
    ).toThrow();
  });
  it("has a real 120-second sequence and readable timer formatting", () => {
    expect(DEMO_SECONDS).toBe(120);
    expect(demoStages).toHaveLength(6);
    expect(clockLabel(0)).toBe("00:00");
    expect(clockLabel(125.9)).toBe("02:05");
    expect(clockLabel(-4)).toBe("00:00");
  });
});
