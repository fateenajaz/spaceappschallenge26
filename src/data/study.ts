import type { KnowledgeAnswers, StudyRecord } from "../types/study";
export const STUDY_KEY = "echo-earth-study-v1";
export const questions = [
  {
    id: "anomaly" as const,
    prompt: "What does a temperature anomaly measure?",
    options: [
      ["absolute", "Earth’s absolute temperature"],
      ["baseline", "A difference from a reference-period average"],
      ["weather", "The temperature at one weather station"],
      ["unsure", "I’m not sure"],
    ],
  },
  {
    id: "pitch" as const,
    prompt: "In this experience, what does a higher pitch represent?",
    options: [
      ["warmer", "A higher global temperature anomaly"],
      ["volume", "A louder sound"],
      ["faster", "A faster passage of time"],
      ["unsure", "I’m not sure"],
    ],
  },
];
export const knowledgeScore = (a: KnowledgeAnswers) =>
  Number(a.anomaly === "baseline") + Number(a.pitch === "warmer");
export function validateStudy(value: unknown): value is StudyRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as StudyRecord;
  const answers = (a: KnowledgeAnswers) =>
    a && questions.every((q) => q.options.some(([v]) => v === a[q.id]));
  const validStructure =
    r.version === 1 &&
    r.protocolVersion === "1.0.0" &&
    typeof r.id === "string" &&
    typeof r.createdAt === "string" &&
    Number.isFinite(Date.parse(r.createdAt)) &&
    typeof r.datasetId === "string" &&
    answers(r.pre) &&
    answers(r.post) &&
    ["yes", "somewhat", "no", "unsure"].includes(r.helpfulness) &&
    ["headphones", "speakers", "no-audio"].includes(r.device) &&
    typeof r.observerNotes === "string" &&
    r.observerNotes.length <= 1000 &&
    Boolean(r.listening) &&
    ["A", "B", "uncertain"].includes(r.listening.answer) &&
    [true, false, null].includes(r.listening.correct) &&
    Number.isFinite(r.listening.elapsedSeconds) &&
    r.listening.elapsedSeconds >= 0 &&
    ["A", "B"].every((k) => {
      const p = r.listening.periods?.[k as "A" | "B"];
      return (
        p &&
        Number.isInteger(p.start) &&
        Number.isInteger(p.end) &&
        p.end - p.start === 29 &&
        Number.isFinite(p.mean)
      );
    }) &&
    typeof r.listening.completedSequences?.A === "boolean" &&
    typeof r.listening.completedSequences?.B === "boolean";
  if (!validStructure) return false;
  const { A, B } = r.listening.periods;
  if (!(A.end < B.start || B.end < A.start)) return false;
  const tied = Math.abs(A.mean - B.mean) < 1e-10;
  const expected =
    r.listening.answer === "uncertain" || tied
      ? null
      : r.listening.answer === (A.mean > B.mean ? "A" : "B");
  return r.listening.correct === expected;
}
export function readStudies(storage: Pick<Storage, "getItem">): StudyRecord[] {
  const raw = storage.getItem(STUDY_KEY);
  if (raw === null) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(validateStudy))
    throw new Error(
      "Saved study data could not be validated. It has not been overwritten.",
    );
  if (new Set(parsed.map((r) => r.id)).size !== parsed.length)
    throw new Error("Saved study data contains duplicate session IDs.");
  return parsed;
}
export function summarizeStudies(records: StudyRecord[]) {
  const n = records.length;
  const scores = (phase: "pre" | "post") =>
    records.reduce((s, r) => s + knowledgeScore(r[phase]), 0);
  return {
    sessions: n,
    preCorrect: scores("pre"),
    postCorrect: scores("post"),
    questionResponses: n * 2,
    uncertain: records.filter((r) => r.listening.answer === "uncertain").length,
    correctComparisons: records.filter((r) => r.listening.correct === true)
      .length,
    completedBoth: records.filter(
      (r) =>
        r.listening.completedSequences.A && r.listening.completedSequences.B,
    ).length,
  };
}
export function exportStudies(records: StudyRecord[]) {
  if (!records.every(validateStudy))
    throw new Error("Cannot export invalid study records");
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    protocolVersion: "1.0.0",
    summary: summarizeStudies(records),
    limitations:
      "Local convenience sample; repeated questions; no control group. Descriptive observations do not establish learning benefit or causation. Audio completion is a software event, not proof of hearing.",
    records,
  };
}
export function downloadJSON(value: unknown, filename: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2) + "\n"], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
