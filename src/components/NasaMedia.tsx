import { useEffect, useRef, useState } from "react";
import { records } from "../data/climate-loader";
import { ExternalLink, Film } from "lucide-react";
import { useAudioEngine } from "../hooks/useAudioEngine";
export function NasaMedia({ compact = false }: { compact?: boolean }) {
  const [video, setVideo] = useState(false),
    [failed, setFailed] = useState(false);
  const engine = useAudioEngine();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(
    () =>
      engine.subscribe(() => {
        if (
          engine.getSnapshot().state === "playing" &&
          videoRef.current &&
          !videoRef.current.paused
        )
          videoRef.current.pause();
      }),
    [engine],
  );
  return (
    <section
      className={`nasa-media ${compact ? "compact" : ""}`}
      aria-label="NASA Climate Spiral context"
    >
      <div className="media-image">
        {failed ? (
          <div className="media-fallback">
            NASA media could not load. The annual chart and generated sound
            remain available.
          </div>
        ) : video ? (
          <video
            ref={videoRef}
            controls
            preload="metadata"
            poster="/nasa/climate-spiral.jpg"
            onPlay={() => engine.pause()}
            onError={() => setFailed(true)}
          >
            <source src="/nasa/climate-spiral.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/nasa/climate-spiral.vtt"
              srcLang="en"
              label="Visual description"
              default
            />
          </video>
        ) : (
          <img
            src="/nasa/climate-spiral.jpg"
            width="1080"
            height="1080"
            alt="NASA Climate Spiral: monthly temperature anomalies form rings around a 1951–1980 baseline, with the supplied still labeled 2026."
            loading={compact ? "eager" : "lazy"}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="media-copy">
        <h2>The same record. A different perspective.</h2>
        <p>
          NASA’s Climate Spiral shows monthly GISTEMP observations. Our chart
          and tones use complete annual observations through{" "}
          {records.at(-1)!.year}. The NASA still is labeled 2026 and includes a
          partial year; it is context, not the selected annual frame.
        </p>
        {!compact && (
          <>
            <p className="small">
              The annual chart follows the sound. The original monthly animation
              has its own timeline; opening it pauses annual audio.
            </p>
            <button
              className="button secondary"
              onClick={() => {
                engine.pause();
                setVideo((v) => !v);
                setFailed(false);
              }}
            >
              <Film size={17} />
              {video ? "Show still image" : "View NASA animation"}
            </button>
          </>
        )}
        <a
          className="text-link"
          href="https://svs.gsfc.nasa.gov/5190/"
          target="_blank"
          rel="noreferrer"
        >
          NASA’s Scientific Visualization Studio <ExternalLink size={13} />
        </a>
        <p className="credit">
          Visualization: Mark SubbaRao / NASA SVS; climate spiral concept: Ed
          Hawkins.
        </p>
      </div>
    </section>
  );
}
