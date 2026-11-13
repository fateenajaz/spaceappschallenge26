export type KnowledgeAnswers = { anomaly: string; pitch: string };
export type ListeningResult = {
  answer: "A" | "B" | "uncertain";
  correct: boolean | null;
  periods: {
    A: { start: number; end: number; mean: number };
    B: { start: number; end: number; mean: number };
  };
  completedSequences: { A: boolean; B: boolean };
  elapsedSeconds: number;
};
export type StudyRecord = {
  version: 1;
  id: string;
  createdAt: string;
  datasetId: string;
  protocolVersion: "1.0.0";
  pre: KnowledgeAnswers;
  post: KnowledgeAnswers;
  listening: ListeningResult;
  helpfulness: "yes" | "somewhat" | "no" | "unsure";
  device: "headphones" | "speakers" | "no-audio";
  observerNotes: string;
};
