import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Headphones,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { DetailDialog } from "../components/DetailDialog";
import { ListeningTest } from "./ListeningTest";
import { Discovery } from "./Discovery";

import { FrameJukebox } from "./FrameJukebox";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { clockLabel, DEMO_SECONDS, demoStages } from "../data/presentation";
import type { ListeningResult } from "../types/study";
export function Presenter() {
  const engine = useAudioEngine();
  useEffect(() => {
    engine.stop();
    engine.setSpeed(1);
  }, [engine]);
  const [stage, setStage] = useState(0),
    [running, setRunning] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [stageStarted, setStageStarted] = useState(0),
    [attemptKey, setAttemptKey] = useState(0),
    [result, setResult] = useState<ListeningResult | null>(null);
  const stageHeading = useRef<HTMLHeadingElement>(null),
    firstStage = useRef(true);
  useEffect(() => {
    if (firstStage.current) {
      firstStage.current = false;
      return;
    }
    stageHeading.current?.focus();
  }, [stage]);
  const startedAt = useRef(0),
    elapsedRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      elapsedRef.current = (performance.now() - startedAt.current) / 1000;
      setElapsed(elapsedRef.current);
    }, 200);
    return () => window.clearInterval(id);
  }, [running]);
  function toggleTimer() {
    if (running) {
      elapsedRef.current = (performance.now() - startedAt.current) / 1000;
      setElapsed(elapsedRef.current);
      setRunning(false);
      engine.pause();
    } else {
      startedAt.current = performance.now() - elapsedRef.current * 1000;
      setRunning(true);
    }
  }
  function go(next: number) {
    engine.stop();
    setStage(Math.max(0, Math.min(demoStages.length - 1, next)));
    setStageStarted(elapsedRef.current);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function reset() {
    engine.stop();
    engine.setSpeed(1);
    setRunning(false);
    setElapsed(0);
    elapsedRef.current = 0;
    setStageStarted(0);
    setStage(0);
    setAttemptKey((k) => k + 1);
    setResult(null);
  }
  const current = demoStages[stage],
    stageElapsed = elapsed - stageStarted;
  return (
    <section className="presenter-page">
      <div className="page-heading">
        <h1>
          Let the audience
          <br />
          make the discovery.
        </h1>
        <p className="lead">
          A guided demonstration using the real application. The clock gives
          cues; it never submits an answer or starts sound for you.
        </p>
      </div>
      <div className="presenter-console">
        <div className="demo-time">
          <span className="timer-label">
            Elapsed / TARGET {clockLabel(DEMO_SECONDS)}
          </span>
          <output role="timer" aria-live="off" aria-label="Demo elapsed time">
            {clockLabel(elapsed)}
          </output>
          <span className="small">
            {elapsed > DEMO_SECONDS
              ? `${clockLabel(elapsed - DEMO_SECONDS)} over target`
              : `${clockLabel(DEMO_SECONDS - elapsed)} remaining`}
          </span>
        </div>
        <div className="demo-current">
          <h2 ref={stageHeading} tabIndex={-1}>
            {current.title}
          </h2>
          <p className="small">
            Stage budget: {current.seconds}s ·{" "}
            {stageElapsed > current.seconds
              ? `${clockLabel(stageElapsed - current.seconds)} over`
              : `${clockLabel(current.seconds - stageElapsed)} remaining`}
          </p>
        </div>
        <div className="demo-actions">
          <button className="button primary" onClick={toggleTimer}>
            {running ? <Pause size={17} /> : <Play size={17} />}{" "}
            {running
              ? "Pause timer"
              : elapsed
                ? "Resume timer"
                : "Start demo timer"}
          </button>
          <button className="button secondary" onClick={reset}>
            <RotateCcw size={16} />
            Restart rehearsal
          </button>
        </div>
      </div>
      <div
        className="journey-progress lesson-progress"
        role="progressbar"
        aria-label="Presentation progress"
        aria-valuemin={1}
        aria-valuemax={demoStages.length}
        aria-valuenow={stage + 1}
        aria-valuetext={current.title}
      >
        <span
          style={{ width: `${((stage + 1) / demoStages.length) * 100}%` }}
        />
      </div>
      <details className="presenter-cue" open>
        <summary>Presenter cue — {current.seconds} seconds</summary>
        <p>{current.cue}</p>
        {stage === 2 && result && (
          <p className="mono">
            Computed mean difference:{" "}
            {Math.abs(result.periods.A.mean - result.periods.B.mean).toFixed(3)}{" "}
            °C. Judge’s response:{" "}
            {result.answer === "uncertain"
              ? "uncertain"
              : `Sound ${result.answer}`}
            .
          </p>
        )}
      </details>
      {stage === 0 && (
        <section className="demo-opening">
          <Headphones size={32} />
          <h2>“Can you hear a changing planet?”</h2>
          <p>
            Give the audience a comfortable listening level. Explain that they
            can choose uncertainty or follow the charts instead. Continue to the
            comparison, play both periods, then let their answer open the
            reveal.
          </p>
          <button
            className="button primary"
            onClick={() => {
              if (!running) toggleTimer();
              go(1);
            }}
          >
            Begin the comparison <ArrowRight size={18} />
          </button>
        </section>
      )}
      <div hidden={stage !== 1 && stage !== 2}>
        <ListeningTest
          key={attemptKey}
          embedded
          compact
          onComplete={(r) => {
            setResult(r);
            go(2);
          }}
        />
      </div>
      {stage === 3 && (
        <>
          <FrameJukebox embedded />
          <DetailDialog
            label="Explore the cooler-year discovery"
            title="Variation inside the longer record"
            onOpen={() => engine.pause()}
          >
            <Discovery compact />
          </DetailDialog>
        </>
      )}
      {stage === 4 && (
        <section className="binding-notes">
          <h2>Show the evidence from real users.</h2>
          <p>
            No participant results are preloaded. Use the volunteer dashboard to
            report actual counts, difficulties and changes made. If the pilot
            has not happened, say so and describe the planned evaluation.
          </p>
        </section>
      )}
      {stage === 5 && (
        <section className="binding-notes">
          <h2>A lesson ready to try.</h2>
          <p>
            A five-minute activity with English and draft Arabic guidance, NASA
            sources and a printable teacher guide. The next step is an
            educator-led pilot.
          </p>
        </section>
      )}
      <div className="demo-navigation">
        <button
          className="button secondary"
          disabled={stage === 0}
          onClick={() => go(stage - 1)}
        >
          <ArrowLeft size={17} />
          Previous stage
        </button>
        <p className="small">
          {stage === 1 && !result
            ? "Submit the judge’s response to open the reveal."
            : stage === 5
              ? "End with the source and what the audience discovered."
              : "Use the real controls above; advance when the point is clear."}
        </p>
        {stage < 5 ? (
          <button
            className="button primary"
            disabled={stage === 1 && !result}
            onClick={() => go(stage + 1)}
          >
            Next stage <ArrowRight size={17} />
          </button>
        ) : (
          <a className="button primary" href="#home">
            Finish <ArrowRight size={17} />
          </a>
        )}
      </div>
    </section>
  );
}
