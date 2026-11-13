import {
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { Play, Pause, RotateCcw, Square, ExternalLink } from "lucide-react";
import { eicFrames, eicManifest } from "../data/eic-loader";
import { useAudioEngine } from "../hooks/useAudioEngine";
import {
  analyzeFrame,
  BAND_FREQUENCIES,
  SCORE_COLUMNS,
  COLUMN_SECONDS,
  type FrameScore,
} from "../audio/frame-score";
import { FramePlayer } from "../audio/frame-player";
const sources = eicFrames.filter((frame) =>
  ["2023-08", "2024-05"].includes(frame.id),
);
import { DetailDialog } from "../components/DetailDialog";
export function ImageJukebox({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(0),
    [score, setScore] = useState<FrameScore | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [volume, setVolume] = useState(0.35);
  const [player] = useState(() => new FramePlayer());
  const playback = useSyncExternalStore(
    player.subscribe,
    player.getSnapshot,
    player.getSnapshot,
  );
  const climateEngine = useAudioEngine();
  const source = sources[selected];
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) player.pause();
    };
    document.addEventListener("visibilitychange", hidden);
    const navigate = () => player.pause();
    window.addEventListener("echo-navigation", navigate);
    const unsubscribe = climateEngine.subscribe(() => {
      if (climateEngine.getSnapshot().state === "playing") player.pause();
    });
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("echo-navigation", navigate);
      unsubscribe();
      player.dispose();
    };
  }, [player, climateEngine]);
  useEffect(() => {
    let canceled = false;
    player.stop();
    setScore(null);
    setError("");
    const image = new Image();
    image.onload = () => {
      if (canceled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = Math.max(
          8,
          Math.round((image.naturalHeight / image.naturalWidth) * 512),
        );
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context)
          throw new Error("Image analysis is unavailable in this browser.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setScore(
          analyzeFrame(
            context.getImageData(0, 0, canvas.width, canvas.height).data,
            canvas.width,
            canvas.height,
          ),
        );
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "NASA image analysis failed.",
        );
      }
    };
    image.onerror = () => {
      if (!canceled)
        setError(
          "The NASA source image could not load. No sound was substituted. Retry or follow the text description.",
        );
    };
    image.src = source.image;
    return () => {
      canceled = true;
      image.onload = null;
      image.onerror = null;
      player.stop();
    };
  }, [source.image, retry, player]);
  const play = () => {
    if (!score) return;
    climateEngine.stop();
    if (playback.state === "playing") player.pause();
    else
      void player.play(
        score,
        playback.state === "completed" ? 0 : playback.column,
      );
  };
  const band = score?.columns[playback.column];
  const methodology = (
    <>
      <div className="image-method-grid">
        <div>
          <h3>Position → pitch</h3>
          <p>
            Eight horizontal bands use a fixed pentatonic voicing, from 659.255
            Hz at the top to 246.942 Hz at the bottom. A gentle consonant
            palette helps separate image features without a dense chromatic
            cluster.
          </p>
        </div>
        <div>
          <h3>Color → voice</h3>
          <p>
            Red-dominant pixels activate triangle tones; blue-dominant pixels
            activate sine tones. Neutral, dark, yellow and green pixels are
            suppressed by explicit RGB rules. These rules describe rendered
            color, not a physical climate boundary.
          </p>
        </div>
        <div>
          <h3>Density → level</h3>
          <p>
            The square root of each voice’s pixel fraction sets its level, with
            a fixed gain cap. More retained pixels produce a more present voice.
            Volume remains under your control.
          </p>
        </div>
      </div>
      <p>
        The full image is resized to 512 pixels wide and scanned in{" "}
        {SCORE_COLUMNS} columns at {COLUMN_SECONDS} seconds each (
        {(SCORE_COLUMNS * COLUMN_SECONDS).toFixed(2)} seconds total).
        Color-matched labels can contribute. JPEG compression and resizing
        affect the result; no scientific measurement is inferred from pixels.
      </p>
      {score && (
        <p>
          Analyzed raster: {score.width} × {score.height} pixels. Retained color
          pixels: {score.retainedPixels.toLocaleString()}. Source image SHA-256:{" "}
          <span className="hash">{source.sha256}</span>.
        </p>
      )}
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Image column pixel fractions"
      >
        <table>
          <caption>
            Selected image column {playback.column + 1} · computed pixel
            fractions
          </caption>
          <thead>
            <tr>
              <th scope="col">Band (top to bottom)</th>
              <th scope="col">Frequency</th>
              <th scope="col">Red pixels</th>
              <th scope="col">Blue pixels</th>
            </tr>
          </thead>
          <tbody>
            {band?.map((row, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td>{BAND_FREQUENCIES[i].toFixed(3)} Hz</td>
                <td>{(row.warm * 100).toFixed(2)}%</td>
                <td>{(row.cool * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href="/data/eic-frames.json" target="_blank" rel="noreferrer">
        Inspect the source and asset manifest
      </a>
    </>
  );
  return (
    <section
      className={`image-jukebox ${compact ? "compact-instrument" : ""}`}
      aria-label="NASA image sonification"
    >
      <div
        className="image-source-tabs"
        role="group"
        aria-label="Select an EIC visualization"
      >
        {sources.map((frame, i) => (
          <button
            key={frame.id}
            className={i === selected ? "selected" : ""}
            aria-pressed={i === selected}
            onClick={() => {
              player.stop();
              setSelected(i);
            }}
          >
            {i === 0 ? "01 / The climate spiral" : "02 / The monthly record"}
          </button>
        ))}
      </div>
      <div className="image-instrument">
        <figure className="image-score">
          <div
            className="image-score-raster"
            style={
              {
                "--scan-position": `${((playback.column + 0.5) / SCORE_COLUMNS) * 100}%`,
              } as CSSProperties
            }
          >
            <img
              src={source.image}
              alt={`${source.title}. ${selected === 0 ? "Monthly paths circle a central year, with blue inner paths and red outer paths; January is at the top." : "NASA’s monthly temperature anomaly graph, with successive colored year traces and a 1951–1980 baseline."}`}
              onError={() => {
                player.stop();
                setScore(null);
                setError(
                  "The NASA image could not display. Playback is stopped.",
                );
              }}
            />
            {score && (
              <div className="image-scan" aria-hidden="true">
                <span>{String(playback.column + 1).padStart(2, "0")}</span>
              </div>
            )}
          </div>
          <figcaption>
            {compact
              ? "NASA SVS · Mark SubbaRao; spiral concept: Ed Hawkins."
              : eicManifest.credit}{" "}
            <a href={source.sourceUrl} target="_blank" rel="noreferrer">
              Original NASA visualization <ExternalLink size={12} />
            </a>
          </figcaption>
        </figure>
        <div className="image-score-copy">
          {!compact && (
            <p className="story-eyebrow">THE IMAGE BECOMES THE INSTRUMENT</p>
          )}
          <h2>{source.title}</h2>
          {!compact && (
            <p>
              A line moves left to right across the actual NASA image. Red and
              blue features become two voices; their vertical positions choose
              the notes.
            </p>
          )}
          <div className="image-key">
            <span>
              <i className="warm-key" />
              Red pixels · triangle voice
            </span>
            <span>
              <i className="cool-key" />
              Blue pixels · sine voice
            </span>
          </div>
          <div className="image-transport">
            <button
              className="button primary"
              disabled={!score || playback.state === "loading"}
              onClick={play}
            >
              {playback.state === "playing" ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
              {playback.state === "playing"
                ? "Pause image sound"
                : playback.state === "paused"
                  ? "Resume image sound"
                  : "Play the NASA image"}
            </button>
            <button
              className="icon-button"
              aria-label="Restart image sound"
              disabled={!score}
              onClick={() => {
                climateEngine.stop();
                void player.play(score!, 0);
              }}
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Stop image sound"
              disabled={playback.state === "idle"}
              onClick={() => player.stop()}
            >
              <Square size={18} />
            </button>
          </div>
          <label className="image-volume">
            Image sound volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const value = Number(e.target.value);
                setVolume(value);
                player.setVolume(value);
              }}
            />
          </label>
          <label className="image-volume">
            Scan position
            <input
              type="range"
              min={0}
              max={SCORE_COLUMNS - 1}
              step={1}
              value={playback.column}
              disabled={!score}
              aria-valuetext={`Image column ${playback.column + 1} of ${SCORE_COLUMNS}, spatial position, not a date`}
              onChange={(e) => player.stop(Number(e.target.value))}
            />
          </label>
          <p className="small" role="status">
            {error || playback.error
              ? "Playback unavailable. See the error below."
              : !score
                ? "Reading the local NASA image…"
                : playback.state === "playing"
                  ? "Scanning the image. Sound follows the highlighted column."
                  : playback.state === "paused"
                    ? "Paused. Resume repeats the selected column."
                    : playback.state === "completed"
                      ? "Image scan complete. Replay or choose another visualization."
                      : compact
                        ? "Ready · sound begins when you choose Play."
                        : "Ready. Sound starts only when you choose Play."}
          </p>
          {(error || playback.error) && (
            <div role="alert">
              <p>{error || playback.error}</p>
              <button
                className="button secondary"
                onClick={() => setRetry((n) => n + 1)}
              >
                Retry image analysis
              </button>
            </div>
          )}
          {compact && (
            <div
              className="pixel-bands"
              aria-label="Selected image column color density"
            >
              <span>8 image bands · live pixel density</span>
              <div>
                {band?.map((row, i) => (
                  <i
                    key={i}
                    style={
                      {
                        "--warm": row.warm,
                        "--cool": row.cool,
                      } as CSSProperties
                    }
                  >
                    <b />
                    <em />
                  </i>
                ))}
              </div>
            </div>
          )}
          <p className="image-caveat">
            {compact
              ? "Spatial scan, not a timeline. Artistic sound, not recovered temperature values."
              : "This is a spatial reading of a published image. Scan position is not time. The sounds are our artistic translation, not NASA audio or recovered temperature values."}
          </p>
        </div>
      </div>
      {compact ? (
        <DetailDialog
          label="Why these sounds? Follow the translation."
          title="From NASA pixels to sound"
          onOpen={() => player.pause()}
        >
          <div className="image-method">{methodology}</div>
        </DetailDialog>
      ) : (
        <details className="image-method">
          <summary>Why these sounds? Follow the translation.</summary>
          {methodology}
        </details>
      )}
    </section>
  );
}
