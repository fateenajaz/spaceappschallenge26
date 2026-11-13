import { AudioVisual } from "../components/AudioVisual";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pause,
  Play,
  RotateCcw,
  Square,
} from "lucide-react";
import { useAudio } from "../hooks/useAudioEngine";
import {
  eicFrames,
  eicRecords,
  eicManifest,
  monthly,
  monthLabel,
} from "../data/eic-loader";
import { frequency, normalize } from "../audio/mappings";
import { signed } from "../data/climate-loader";
import { AudioSettings } from "../components/Player";
import { ImageJukebox } from "./ImageJukebox";
export function FrameJukebox({ embedded = false }: { embedded?: boolean }) {
  const Heading = embedded ? "h2" : "h1";
  const { engine, playback } = useAudio();
  const [selected, setSelected] = useState(0),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [mode, setMode] = useState<"image" | "measurement">("measurement"),
    [retry, setRetry] = useState(0),
    [description, setDescription] = useState("");
  const owned = playback.sequenceId === "eic-frames";
  const index =
    owned && ["playing", "paused", "completed"].includes(playback.state)
      ? playback.index
      : selected;
  const frame = eicFrames[index],
    record = frame.record;
  useEffect(() => {
    let canceled = false;
    setReady(false);
    setError("");
    Promise.all(
      eicFrames.map(
        (frame) =>
          new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () =>
              reject(
                new Error(
                  "NASA stills could not load. Audio remains stopped so a missing frame is not presented as synchronized.",
                ),
              );
            image.src = frame.image;
          }),
      ),
    )
      .then(() => {
        if (!canceled) setReady(true);
      })
      .catch((e) => {
        if (!canceled) setError(String(e.message));
      });
    return () => {
      canceled = true;
    };
  }, [retry]);
  function select(i: number) {
    engine.stop();
    setSelected(Math.max(0, Math.min(eicFrames.length - 1, i)));
    setDescription("");
  }
  function play(restart = false) {
    if (!ready) return;
    if (owned && playback.state === "playing" && !restart) engine.pause();
    else if (owned && playback.state === "paused" && !restart)
      void engine.resume();
    else
      void engine.play(eicRecords, "eic-frames", restart ? 0 : index, {
        domain: monthly.domain,
        eventSeconds: 1.2,
      });
  }
  return (
    <section>
      <div className="page-heading">
        <Heading>
          See the observation.
          <br />
          Hear its measurement.
        </Heading>
        <p className="lead">
          Explore NASA imagery as a spatial soundscape, then hear three dated
          snapshots paired with their monthly GISTEMP measurements.
        </p>
      </div>
      {!embedded && (
        <nav
          className="mode-switch"
          aria-label="Choose the sonification method"
        >
          <button
            aria-pressed={mode === "image"}
            onClick={() => {
              engine.stop();
              window.dispatchEvent(new Event("echo-navigation"));
              setMode("image");
            }}
          >
            Image → sound
            <span>Colors and positions become a spatial score</span>
          </button>
          <button
            aria-pressed={mode === "measurement"}
            onClick={() => {
              engine.stop();
              window.dispatchEvent(new Event("echo-navigation"));
              setMode("measurement");
            }}
          >
            Measurement → pitch<span>A dated NASA anomaly becomes a tone</span>
          </button>
        </nav>
      )}
      {!embedded && mode === "image" ? (
        <div className="mode-scene" key="image">
          <ImageJukebox compact />
        </div>
      ) : (
        <div className="mode-scene" key="measurement">
          <div className="frame-workbench">
            <div className="bound-frame">
              <img
                key={`${frame.id}-${retry}`}
                src={frame.image}
                onError={() => {
                  engine.stop();
                  setReady(false);
                  setError(
                    "The active NASA still could not display. Playback has stopped; retry loading the images.",
                  );
                }}
                alt={`${frame.title}. Official NASA visualization of monthly global temperature anomalies relative to 1951–1980.`}
              />
              <AudioVisual
                sequencePrefix="eic-"
                compact
                label="Live waveform paired with the NASA snapshot"
              />
              <p className="credit">{eicManifest.credit}</p>
              <div className="frame-date">
                <span>NASA VISUAL ENDPOINT</span>
                <strong data-testid="frame-date">{monthLabel(record)}</strong>
              </div>
            </div>
            <div className="frame-measurement">
              <h2>{monthLabel(record)}</h2>
              <dl>
                <div>
                  <dt>Monthly anomaly</dt>
                  <dd data-testid="frame-anomaly">
                    {signed(record.anomalyC)} <small>°C</small>
                  </dd>
                </div>
                <div>
                  <dt>Generated frequency</dt>
                  <dd data-testid="frame-frequency">
                    {frequency(record.anomalyC, monthly.domain).toFixed(1)}{" "}
                    <small>Hz</small>
                  </dd>
                </div>
              </dl>
              <p>
                One selected date drives this image, the displayed value and the
                tone. Both image dates and the 1951–1980 baseline are documented
                in the binding manifest.
              </p>
              <button
                className="button secondary"
                disabled={!ready}
                onClick={() =>
                  void engine.play([record], `eic-preview-${frame.id}`, 0, {
                    domain: monthly.domain,
                    eventSeconds: 1.2,
                  })
                }
              >
                <Play size={17} />
                Hear this month
              </button>
              <a
                className="text-link"
                href={frame.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Inspect this NASA source <ExternalLink size={14} />
              </a>
            </div>
            <div className="frame-controls">
              <label className="lesson-scrubber">
                Scrub verified NASA endpoints
                <input
                  type="range"
                  min={0}
                  max={eicFrames.length - 1}
                  step={1}
                  value={index}
                  aria-valuetext={monthLabel(record)}
                  onChange={(event) => select(Number(event.target.value))}
                />
              </label>
              <button
                className="button secondary"
                onClick={() => {
                  engine.pause();
                  setDescription(
                    `${monthLabel(record)}. This NASA image summarizes the record through this month. The selected monthly global temperature anomaly is ${signed(record.anomalyC)} degrees Celsius relative to 1951–1980. Its generated tone is ${frequency(record.anomalyC, monthly.domain).toFixed(1)} hertz. Higher anomalies produce higher pitches. The tone represents the endpoint, not every point in the image.`,
                  );
                }}
              >
                Describe this moment
              </button>
              <p role="status" aria-live="polite">
                {description}
              </p>
              <div
                className="frame-tabs"
                role="group"
                aria-label="Choose a NASA snapshot"
              >
                {eicFrames.map((f, i) => (
                  <button
                    key={f.id}
                    className={i === index ? "selected" : ""}
                    onClick={() => select(i)}
                    aria-pressed={i === index}
                  >
                    {monthLabel(f.record)}
                  </button>
                ))}
              </div>
              <div className="explorer-controls">
                <div className="transport">
                  <button
                    className="icon-button"
                    aria-label="Previous NASA snapshot"
                    disabled={index === 0}
                    onClick={() => select(index - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="button primary"
                    disabled={!ready || playback.state === "loading"}
                    onClick={() => play()}
                  >
                    {owned && playback.state === "playing" ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}{" "}
                    {owned && playback.state === "playing"
                      ? "Pause snapshots"
                      : owned && playback.state === "paused"
                        ? "Resume snapshots"
                        : "Play snapshots"}
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Replay NASA snapshots"
                    disabled={!ready}
                    onClick={() => play(true)}
                  >
                    <RotateCcw size={17} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Stop NASA snapshots"
                    disabled={
                      !playback.sequenceId.startsWith("eic-") ||
                      !["playing", "paused", "loading"].includes(playback.state)
                    }
                    onClick={() => {
                      engine.stop();
                      setSelected(0);
                    }}
                  >
                    <Square size={17} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Next NASA snapshot"
                    disabled={index === eicFrames.length - 1}
                    onClick={() => select(index + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <AudioSettings />
              </div>
              {!ready && !error && (
                <p role="status">
                  Loading all three local NASA stills before playback…
                </p>
              )}
              {error && (
                <div role="alert" className="error-box">
                  <p>{error}</p>
                  <button
                    className="button secondary"
                    onClick={() => setRetry((r) => r + 1)}
                  >
                    Retry NASA images
                  </button>
                </div>
              )}
            </div>
          </div>
          <details className="binding-notes pairing-notes">
            <summary>Read the pairing correctly.</summary>

            <p>
              Equal anomalies produce equal pitches. These snapshots illustrate
              source traceability, not a trend inferred from three notes. They
              are selected endpoints, not consecutive months: July and August
              2023, then May 2024. Each still summarizes history through its
              documented endpoint; the tone encodes that endpoint month only. A
              still is held for 1.2 seconds at normal speed. This is a curated
              frame sequence, not synchronization to every frame of NASA’s
              original movie.
            </p>
            <p>{eicManifest.revisionNote}</p>
            <p>
              The monthly mode fixes its domain using all{" "}
              {monthly.records.length.toLocaleString()} monthly observations
              from complete years 1880–2025: {signed(monthly.domain.min)} to{" "}
              {signed(monthly.domain.max)} °C → 220–660 Hz. The annual listening
              test keeps its original annual domain. Pitches across these two
              modes should not be compared directly.
            </p>
          </details>
          <details className="formula-details">
            <summary>Audit the frame-to-data binding</summary>
            <dl className="binding-audit">
              <div>
                <dt>Source visualization</dt>
                <dd>
                  <a href={frame.sourceUrl} target="_blank" rel="noreferrer">
                    {frame.title}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Published / reviewed</dt>
                <dd>
                  {frame.publicationDate} / {eicManifest.reviewedOn}
                </dd>
              </div>
              <div>
                <dt>Verification evidence</dt>
                <dd>{frame.evidence}</dd>
              </div>
              <div>
                <dt>Image SHA-256</dt>
                <dd className="hash">{frame.sha256}</dd>
              </div>
              <div>
                <dt>Observation → normalized → frequency</dt>
                <dd>
                  {signed(record.anomalyC)} °C →{" "}
                  {normalize(record.anomalyC, monthly.domain).toFixed(6)} →{" "}
                  {frequency(record.anomalyC, monthly.domain).toFixed(3)} Hz
                </dd>
              </div>
            </dl>
            <a
              className="text-link"
              href="/data/eic-frames.json"
              target="_blank"
              rel="noreferrer"
            >
              Download binding manifest <ExternalLink size={14} />
            </a>
            <a className="text-link" href="/data/monthly.json" download>
              Download validated monthly observations ↓
            </a>
          </details>
        </div>
      )}
    </section>
  );
}
