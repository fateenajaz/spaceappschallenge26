import { useEffect, useRef, useState } from "react";
import { ArrowRight, ClipboardList, Download, RotateCcw } from "lucide-react";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { ListeningTest } from "./ListeningTest";
import { KnowledgeQuestions } from "../components/KnowledgeQuestions";
import { dataset } from "../data/climate-loader";
import {
  downloadJSON,
  exportStudies,
  knowledgeScore,
  readStudies,
  STUDY_KEY,
  summarizeStudies,
} from "../data/study";
import type {
  KnowledgeAnswers,
  ListeningResult,
  StudyRecord,
} from "../types/study";
const empty: KnowledgeAnswers = { anomaly: "", pitch: "" };
export function Study() {
  const engine = useAudioEngine();
  const region = useRef<HTMLElement>(null),
    firstPhase = useRef(true);
  const [currentRecord, setCurrentRecord] = useState<StudyRecord | null>(null);
  const [phase, setPhase] = useState<
    "setup" | "pre" | "listen" | "post" | "saved"
  >("setup");
  useEffect(() => {
    if (firstPhase.current) {
      firstPhase.current = false;
      return;
    }
    const heading = region.current?.querySelector<HTMLHeadingElement>("h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus();
  }, [phase]);
  const [consent, setConsent] = useState(false),
    [device, setDevice] = useState<StudyRecord["device"]>("headphones");
  const [pre, setPre] = useState(empty),
    [post, setPost] = useState(empty),
    [result, setResult] = useState<ListeningResult | null>(null);
  const [helpfulness, setHelpfulness] =
      useState<StudyRecord["helpfulness"]>("unsure"),
    [notes, setNotes] = useState("");
  const [initialStorage] = useState(() => {
    try {
      return { records: readStudies(localStorage), error: "" };
    } catch (e) {
      return {
        records: [] as StudyRecord[],
        error: `Saved study results could not be read: ${e instanceof Error ? e.message : "Browser storage unavailable"}`,
      };
    }
  });
  const [error, setError] = useState(initialStorage.error),
    [sessions, setSessions] = useState<StudyRecord[]>(initialStorage.records);
  const [savedId, setSavedId] = useState<string | null>(null);
  const summary = summarizeStudies(sessions);
  function save() {
    if (!result || !consent) return;
    const record: StudyRecord = {
      version: 1,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      datasetId: dataset.id,
      protocolVersion: "1.0.0",
      pre,
      post,
      listening: result,
      helpfulness,
      device,
      observerNotes: notes.trim(),
    };
    setCurrentRecord(record);
    try {
      const existing = readStudies(localStorage);
      const next = [...existing, record];
      localStorage.setItem(STUDY_KEY, JSON.stringify(next));
      setSessions(next);
      setSavedId(record.id);
      setPhase("saved");
      setError("");
    } catch (e) {
      setError(
        `Could not save this session: ${e instanceof Error ? e.message : "Browser storage unavailable"}. You can download this session instead.`,
      );
    }
  }
  function downloadCurrent() {
    if (currentRecord)
      downloadJSON(
        exportStudies([currentRecord]),
        "echo-earth-current-session.json",
      );
  }
  function reset() {
    engine.stop();
    setPhase("setup");
    setConsent(false);
    setPre(empty);
    setPost(empty);
    setResult(null);
    setNotes("");
    setHelpfulness("unsure");
    setError(initialStorage.error);
    setCurrentRecord(null);
    setSavedId(null);
  }
  return (
    <section ref={region}>
      <div className="page-heading">
        <h1>
          Find out what people
          <br />
          actually understand.
        </h1>
        <p className="lead">
          A short, observer-led session: two questions, a blind comparison, a
          scientific reveal, and a second check. Record observations, not
          assumptions.
        </p>
      </div>
      <div className="study-progress" aria-label="Study stages">
        {["Consent", "Before", "Listen & reveal", "After", "Saved"].map(
          (label, i) => (
            <span
              className={
                i === ["setup", "pre", "listen", "post", "saved"].indexOf(phase)
                  ? "current"
                  : ""
              }
              aria-current={
                i === ["setup", "pre", "listen", "post", "saved"].indexOf(phase)
                  ? "step"
                  : undefined
              }
              key={label}
            >
              {i + 1}. {label}
            </span>
          ),
        )}
      </div>
      {error && phase !== "post" && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      {phase !== "setup" && phase !== "saved" && (
        <button className="button quiet" onClick={reset}>
          Stop and discard unfinished session
        </button>
      )}
      {phase === "setup" && (
        <section className="study-panel">
          <ClipboardList size={26} />
          <h2>Before you invite a participant</h2>
          <p>
            Use volunteers who have not already explored the app. Read the same
            neutral script each time. Allow “I’m not sure,” skipping audio, and
            stopping at any point. For school sessions, follow your
            institution’s consent process.
          </p>
          <blockquote>
            “We are testing this experience, not you. You’ll answer two
            questions, compare two sounds if comfortable, see the underlying
            observations, and answer again. There is no penalty for
            uncertainty.”
          </blockquote>
          <p className="small">
            No names, email addresses, age, diagnoses, recordings or personal
            details. Results stay in this browser and are saved only when you
            explicitly finish the session. Nothing is uploaded. Other people
            using this browser may see saved results.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPhase("pre");
            }}
          >
            <label className="field-label">
              Audio setup
              <select
                value={device}
                onChange={(e) =>
                  setDevice(e.target.value as StudyRecord["device"])
                }
              >
                <option value="headphones">Headphones</option>
                <option value="speakers">Speakers</option>
                <option value="no-audio">No audio / text and charts</option>
              </select>
            </label>
            <label className="check-label">
              <input
                required
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              The volunteer agrees to an anonymous local session and understands
              they may stop.
            </label>
            <button
              className="button primary"
              type="submit"
              disabled={!consent}
            >
              Begin baseline questions <ArrowRight size={17} />
            </button>
          </form>
        </section>
      )}
      {phase === "pre" && (
        <form
          className="study-panel"
          onSubmit={(e) => {
            e.preventDefault();
            setPhase("listen");
          }}
        >
          <h2>Before the experience</h2>
          <p>
            Choose what you currently think. No feedback is shown yet. The
            observer should not explain the answers.
          </p>
          <KnowledgeQuestions answers={pre} onChange={setPre} />
          <button className="button primary" type="submit">
            Continue to the listening test <ArrowRight size={17} />
          </button>
        </form>
      )}
      {phase === "listen" && (
        <div>
          <ListeningTest
            embedded
            audioEnabled={device !== "no-audio"}
            onComplete={setResult}
          />
          <div className="study-continue">
            <p>
              {result
                ? "Take time to inspect the reveal before answering the next questions."
                : "Submit your comparison to reveal the observations. Audio is optional."}
            </p>
            <button
              className="button primary"
              disabled={!result}
              onClick={() => setPhase("post")}
            >
              Continue to follow-up <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
      {phase === "post" && (
        <form
          className="study-panel"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <h2>After the experience</h2>
          <p>
            Answer independently, then describe what was clear or confusing.
            Repeating these questions can itself affect answers; this is an
            exploratory usability check.
          </p>
          <KnowledgeQuestions answers={post} onChange={setPost} />
          <label className="field-label">
            Did hearing the data help you understand the pattern?
            <select
              value={helpfulness}
              onChange={(e) =>
                setHelpfulness(e.target.value as StudyRecord["helpfulness"])
              }
            >
              <option value="unsure">Unsure / did not use audio</option>
              <option value="yes">Yes</option>
              <option value="somewhat">Somewhat</option>
              <option value="no">Not really</option>
            </select>
          </label>
          <label className="field-label">
            Observer notes — no personal information
            <textarea
              maxLength={1000}
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe an observed hesitation, misunderstanding, or control that was hard to use."
            />
          </label>
          <button className="button primary" type="submit">
            Save anonymous session
          </button>
          {error && (
            <>
              <p role="alert" className="error-box">
                {error}
              </p>
              <button
                className="button secondary"
                type="button"
                onClick={downloadCurrent}
              >
                <Download size={17} />
                Download current session
              </button>
            </>
          )}
        </form>
      )}
      {phase === "saved" && (
        <section className="study-panel">
          <h2>One observation, recorded honestly.</h2>
          <p>
            Quiz responses: {knowledgeScore(pre)} / 2 before,{" "}
            {knowledgeScore(post)} / 2 after. This is a descriptive result from
            repeated questions, not proof of learning benefit.
          </p>
          <p className="small">
            Session ID: <span className="hash">{savedId}</span>. No participant
            identity was collected.
          </p>
          <div className="reveal-actions">
            <button className="button primary" onClick={reset}>
              <RotateCcw size={17} />
              New participant
            </button>
            <button className="button secondary" onClick={downloadCurrent}>
              <Download size={17} />
              Download this session
            </button>
          </div>
        </section>
      )}
      <section className="study-results">
        <h2>What you have recorded</h2>
        {!sessions.length ? (
          <p>
            No completed sessions are saved in this browser. Run actual
            volunteer sessions to populate these results. We have not conducted
            a human study for you.
          </p>
        ) : (
          <>
            <div className="study-summary">
              <div>
                <strong>{summary.sessions}</strong>
                <span>Saved sessions</span>
              </div>
              <div>
                <strong>
                  {summary.preCorrect}/{summary.questionResponses}
                </strong>
                <span>Correct baseline responses</span>
              </div>
              <div>
                <strong>
                  {summary.postCorrect}/{summary.questionResponses}
                </strong>
                <span>Correct follow-up responses</span>
              </div>
              <div>
                <strong>{summary.completedBoth}</strong>
                <span>Both audio sequences completed</span>
              </div>
            </div>
            <p>
              {summary.correctComparisons} correct comparisons;{" "}
              {summary.uncertain} uncertain responses. Audio completion records
              playback software state, not proof that a person heard it. This
              convenience sample has no control group; do not infer causation or
              generalize its results.
            </p>
            <button
              className="button secondary"
              onClick={() =>
                downloadJSON(
                  exportStudies(sessions),
                  "echo-earth-study-results.json",
                )
              }
            >
              <Download size={17} />
              Export all local results
            </button>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Saved anonymous sessions"
            >
              <table>
                <caption>Anonymous sessions saved on this browser only</caption>
                <thead>
                  <tr>
                    <th scope="col">Session</th>
                    <th scope="col">Before / 2</th>
                    <th scope="col">After / 2</th>
                    <th scope="col">Comparison</th>
                    <th scope="col">Audio setup</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((r, i) => (
                    <tr key={r.id}>
                      <th scope="row">{i + 1}</th>
                      <td>{knowledgeScore(r.pre)}</td>
                      <td>{knowledgeScore(r.post)}</td>
                      <td>
                        {r.listening.correct === null
                          ? "Uncertain"
                          : r.listening.correct
                            ? "Correct"
                            : "Different selection"}
                      </td>
                      <td>{r.device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="small">
          Use the same script and device conditions, record accessibility
          barriers without medical details, and ask permission before quoting
          feedback. Exported files should be reviewed before sharing.
        </p>
      </section>
    </section>
  );
}
