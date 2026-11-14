import { AudioVisual } from "../components/AudioVisual";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Headphones, RotateCcw, Square } from "lucide-react";
import { createAttempt, signed, presets } from "../data/climate-loader";
import { useAudio } from "../hooks/useAudioEngine";
import { PlayButton, AudioSettings } from "../components/Player";
import { ClimateChart, DataTable, type Series } from "../components/Charts";
import type { ListeningResult } from "../types/study";
import { Discovery } from "./Discovery";
import { DetailDialog } from "../components/DetailDialog";
type Answer = "A" | "B" | "uncertain";
export function ListeningTest({
  embedded = false,
  compact = false,
  onComplete,
  audioEnabled = true,
}: {
  embedded?: boolean;
  compact?: boolean;
  audioEnabled?: boolean;
  onComplete?: (result: ListeningResult) => void;
}) {
  const Heading = embedded ? "h2" : "h1";
  const started = useRef(Date.now());
  const completed = useRef({ A: false, B: false });
  const { engine, playback } = useAudio();
  const [preset, setPreset] = useState(0),
    [attempt, setAttempt] = useState(() => createAttempt()),
    [answer, setAnswer] = useState<Answer | null>(null),
    [revealed, setRevealed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (playback.state === "completed") {
      if (playback.sequenceId === "test-A") completed.current.A = true;
      if (playback.sequenceId === "test-B") completed.current.B = true;
    }
  }, [playback.state, playback.sequenceId]);
  useEffect(() => {
    if (revealed) heading.current?.focus();
  }, [revealed]);
  const winner = attempt.A.mean > attempt.B.mean ? "A" : "B";
  const tie = Math.abs(attempt.A.mean - attempt.B.mean) < 1e-10;
  const series: Series[] = useMemo(
    () => [
      {
        label: `A · ${attempt.A.start}–${attempt.A.end}`,
        records: attempt.A.records,
        color: "var(--blue)",
      },
      {
        label: `B · ${attempt.B.start}–${attempt.B.end}`,
        records: attempt.B.records,
        color: "var(--amber)",
      },
    ],
    [attempt],
  );
  function reset(next = preset) {
    engine.stop();
    started.current = Date.now();
    completed.current = { A: false, B: false };
    setAttempt(createAttempt(next));
    setAnswer(null);
    setRevealed(false);
    setPreset(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <section className={`test-page ${compact ? "compact-listening" : ""}`}>
      {!(compact && revealed) && (
        <div className="page-heading">
          <Heading>
            {revealed
              ? "Now, meet the observations."
              : "Listen before you look."}
          </Heading>
          <p className="lead">
            {revealed
              ? "The sounds were generated from these NASA measurements. Here is what they reveal."
              : "Two 30-year periods. One note for each year. The same pitch mapping for both."}
          </p>
        </div>
      )}
      {!(compact && revealed) && (
        <div className="listening-grid">
          {(["A", "B"] as const).map((label) => {
            const id = `test-${label}`,
              owned = playback.sequenceId === id;
            const p = owned ? playback.progress : 0;
            return (
              <article
                className={`sound-panel ${owned && playback.state === "playing" ? "is-playing" : ""}`}
                key={label}
              >
                <div className="sound-top">
                  <h2>Sound {label}</h2>
                  <span className="sound-state">
                    {owned && playback.state === "playing"
                      ? "Playing"
                      : owned && playback.state === "paused"
                        ? "Paused"
                        : "Ready"}
                  </span>
                </div>
                <p>
                  {revealed
                    ? `${attempt[label].start}–${attempt[label].end} · ${signed(attempt[label].mean, 3)} °C mean`
                    : "Dates hidden. Let the pitch be your guide."}
                </p>
                <AudioVisual
                  sequencePrefix={id}
                  earth
                  mode={revealed ? "waveform" : "amplitude"}
                  color={label === "A" ? "#83c7ff" : "#ffbb83"}
                  label={
                    revealed
                      ? `Live waveform for Sound ${label}`
                      : `Live amplitude for Sound ${label}; dates and frequencies are hidden`
                  }
                />
                <progress
                  className="sound-progress"
                  value={p}
                  max={1}
                  aria-label={`Sound ${label} playback progress`}
                />
                <div className="sound-controls">
                  <PlayButton
                    id={id}
                    records={attempt[label].records}
                    disabled={!audioEnabled}
                    label={`Play Sound ${label}`}
                  />
                  <button
                    className="icon-button"
                    aria-label={`Replay Sound ${label}`}
                    disabled={!audioEnabled}
                    onClick={() => void engine.play(attempt[label].records, id)}
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Stop Sound ${label}`}
                    disabled={
                      !owned ||
                      !["playing", "paused", "loading"].includes(playback.state)
                    }
                    onClick={() => engine.stop()}
                  >
                    <Square size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {!(compact && revealed) && (
        <div className="listening-settings">
          <p className="small">
            <Headphones size={16} />
            Higher pitch represents a higher anomaly. Volume stays constant.
          </p>
          {audioEnabled ? (
            <AudioSettings />
          ) : (
            <p className="small">
              Audio is disabled for this session. Choose uncertainty to continue
              to the charts and explanation.
            </p>
          )}
        </div>
      )}
      {!revealed ? (
        <form
          className="answer-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (answer) {
              engine.stop();
              setRevealed(true);
              onComplete?.({
                answer,
                correct:
                  answer === "uncertain" || tie ? null : answer === winner,
                periods: {
                  A: {
                    start: attempt.A.start,
                    end: attempt.A.end,
                    mean: attempt.A.mean,
                  },
                  B: {
                    start: attempt.B.start,
                    end: attempt.B.end,
                    mean: attempt.B.mean,
                  },
                },
                completedSequences: { ...completed.current },
                elapsedSeconds: Math.max(
                  0,
                  (Date.now() - started.current) / 1000,
                ),
              });
            }
          }}
        >
          <fieldset>
            <legend>
              Which period had a higher average global temperature anomaly?
            </legend>
            <div className="answer-options">
              {[
                ["A", "Sound A"],
                ["B", "Sound B"],
                ["uncertain", "I couldn’t tell"],
              ].map(([value, label]) => (
                <label
                  className={`answer-option ${answer === value ? "selected" : ""}`}
                  key={value}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={value}
                    checked={answer === value}
                    onChange={() => setAnswer(value as Answer)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button primary" type="submit" disabled={!answer}>
            Reveal the Science <ArrowRight size={18} />
          </button>
          <p className="small">
            There’s no penalty for uncertainty. You can explore the science
            without hearing the tones.
          </p>
        </form>
      ) : (
        <section className="reveal">
          <h2 ref={heading} tabIndex={-1}>
            {tie
              ? "These periods have equal mean anomalies."
              : answer === "uncertain"
                ? "Uncertainty is part of discovery."
                : answer === winner
                  ? "You heard the difference."
                  : "Here’s what the observations show."}
          </h2>
          <p>
            {tie ? (
              "The computed averages are equal for these periods."
            ) : (
              <>
                Sound <strong>{winner}</strong> represents the warmer period on
                average. Its mean anomaly is{" "}
                <strong>
                  {Math.abs(attempt.A.mean - attempt.B.mean).toFixed(3)} °C
                  higher
                </strong>
                .
              </>
            )}
          </p>
          <div className="mean-comparison">
            {(["A", "B"] as const).map((l) => (
              <div key={l}>
                <p className="period-label">
                  Sound {l} · {attempt[l].start}–{attempt[l].end}
                </p>
                <p className={`mean-value ${l === "B" ? "warm-text" : ""}`}>
                  {signed(attempt[l].mean, 3)}
                  <span> °C</span>
                </p>
                <p className="small">
                  Mean annual anomaly
                  {!tie && winner === l ? " · warmer period" : ""}
                </p>
              </div>
            ))}
          </div>
          {compact ? (
            <DetailDialog
              label="Inspect the chart and source values"
              title="The observations behind the sounds"
              onOpen={() => engine.pause()}
            >
              {" "}
              <div className="chart-heading">
                <h3>30 years, side by side</h3>
                <div className="legend">
                  {series.map((s, i) => (
                    <span key={s.label}>
                      <i
                        style={{
                          background: i ? "var(--amber)" : "var(--blue)",
                        }}
                      />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
              <ClimateChart series={series} relative />
              <DataTable series={series} />
              <div className="explanation-grid">
                <div>
                  <h3>A difference from a baseline.</h3>
                  <p>
                    An anomaly is a departure from the 1951–1980 average, not
                    Earth’s absolute temperature. A value of +1 °C means one
                    degree above that reference average.
                  </p>
                </div>
                <div>
                  <h3>A pattern across decades.</h3>
                  <p>
                    Individual years fluctuate. Comparing 30-year averages helps
                    distinguish a longer-term pattern from a single warm or cool
                    year. Higher anomalies became higher pitches using one fixed
                    range.
                  </p>
                </div>
              </div>
            </DetailDialog>
          ) : (
            <>
              {" "}
              <div className="chart-heading">
                <h3>30 years, side by side</h3>
                <div className="legend">
                  {series.map((s, i) => (
                    <span key={s.label}>
                      <i
                        style={{
                          background: i ? "var(--amber)" : "var(--blue)",
                        }}
                      />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
              <ClimateChart series={series} relative />
              <DataTable series={series} />
              <div className="explanation-grid">
                <div>
                  <h3>A difference from a baseline.</h3>
                  <p>
                    An anomaly is a departure from the 1951–1980 average, not
                    Earth’s absolute temperature. A value of +1 °C means one
                    degree above that reference average.
                  </p>
                </div>
                <div>
                  <h3>A pattern across decades.</h3>
                  <p>
                    Individual years fluctuate. Comparing 30-year averages helps
                    distinguish a longer-term pattern from a single warm or cool
                    year. Higher anomalies became higher pitches using one fixed
                    range.
                  </p>
                </div>
              </div>
            </>
          )}
          {!embedded && (
            <div className="reveal-actions">
              <button
                className="button secondary"
                onClick={() => {
                  engine.stop();
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
              >
                <Headphones size={17} />
                Listen Again
              </button>
              <button
                className="button quiet"
                onClick={() => reset((preset + 1) % presets.length)}
              >
                <RotateCcw size={16} />
                Try Another Comparison
              </button>
            </div>
          )}
          {!embedded && <Discovery />}
          {!compact && (
            <div className="learning-note">
              <Check size={18} />
              <p>
                What did a higher pitch represent?{" "}
                <strong>A higher global temperature anomaly.</strong> The sound
                encodes measurements; it does not establish causation or measure
                your scientific ability.
              </p>
            </div>
          )}
          {compact && (
            <button
              className="detail-trigger"
              onClick={() => {
                engine.stop();
                setRevealed(false);
              }}
            >
              Replay the comparison
            </button>
          )}
        </section>
      )}
    </section>
  );
}
