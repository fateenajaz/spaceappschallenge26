import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Headphones } from "lucide-react";
import { ImageJukebox } from "./ImageJukebox";
import { ListeningTest } from "./ListeningTest";
import { Discovery } from "./Discovery";
import { DetailDialog } from "../components/DetailDialog";
import { eicFrames } from "../data/eic-loader";
import { records } from "../data/climate-loader";
import { useAudioEngine } from "../hooks/useAudioEngine";
import type { ListeningResult } from "../types/study";
const chapters = [
  {
    label: "Our home",
    title: "A planet worth listening to.",
  },
  {
    label: "A visual language",
    title: "Every line holds a measurement.",
  },
  {
    label: "An audible image",
    title: "Let the picture become a score.",
  },
  {
    label: "Your discovery",
    title: "What can your ears tell you?",
  },
  {
    label: "The bigger picture",
    title: "A changing climate has variations.",
  },
  {
    label: "Keep listening",
    title: "A discovery becomes a conversation.",
  },
];
export function Story() {
  const [chapter, setChapter] = useState(0),
    [direction, setDirection] = useState("forward");
  const [result, setResult] = useState<ListeningResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null),
    first = useRef(true);
  const engine = useAudioEngine();
  const [leaving, setLeaving] = useState(false);
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (transition.current) clearTimeout(transition.current);
    },
    [],
  );
  const current = chapters[chapter],
    frame = eicFrames[1];
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [chapter]);
  function go(next: number) {
    engine.stop();
    window.dispatchEvent(new Event("echo-navigation"));
    if (next === chapter) return;
    if (transition.current) clearTimeout(transition.current);
    setDirection(next < chapter ? "backward" : "forward");
    setLeaving(true);
    const commit = () => {
      setChapter(next);
      if (next === 3) setResult(null);
      setLeaving(false);
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) commit();
    else transition.current = setTimeout(commit, 160);
  }
  return (
    <article
      className={`earth-story focused-story story-chapter-${chapter} ${leaving ? "scene-leaving" : ""}`}
    >
      <div
        className="journey-progress"
        role="progressbar"
        aria-label="Journey progress"
        aria-valuemin={1}
        aria-valuemax={chapters.length}
        aria-valuenow={chapter + 1}
        aria-valuetext={`${chapter + 1} of ${chapters.length}, ${current.label}`}
      >
        <span
          style={{ width: `${((chapter + 1) / chapters.length) * 100}%` }}
        />
      </div>
      <div className={`story-scene story-${direction}`} key={chapter}>
        {chapter === 0 ? (
          <section className="story-opening">
            <div className="story-opening-copy">
              <h1 ref={heading} tabIndex={-1}>
                A planet worth
                <br />
                <em>listening to.</em>
              </h1>
              <p className="story-opening-intro">
                A picture can hold a changing planet.
                <br />
                What happens when we give it a voice?
              </p>
              <button className="button primary large" onClick={() => go(1)}>
                Begin the journey <ArrowRight size={20} />
              </button>
              <p className="story-listening-note">
                <Headphones size={16} /> Sound is your choice. Text and
                measurements accompany the journey.
              </p>
            </div>
            <figure className="story-earth">
              <img
                src="/nasa/blue-marble-east.webp"
                alt="NASA Blue Marble composite showing Africa, Asia and the Indian Ocean against space."
                width="1400"
                height="1400"
                fetchPriority="high"
              />
              <figcaption>
                Our home, seen by NASA.
                <br />
                <a
                  href="https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Blue Marble · NASA Earth Observatory{" "}
                  <ExternalLink size={12} />
                </a>
              </figcaption>
            </figure>
          </section>
        ) : (
          <>
            <header className="story-chapter-heading">
              <h1 ref={heading} tabIndex={-1}>
                {current.title}
              </h1>
            </header>
            {chapter === 1 && (
              <section className="story-looking">
                <figure>
                  <img
                    src={frame.image}
                    alt="NASA’s August 2023 climate spiral. Monthly paths circle the center, with blue inner paths and red outer paths."
                  />
                  <figcaption>
                    NASA’s Scientific Visualization Studio · Mark SubbaRao;
                    spiral concept: Ed Hawkins.
                  </figcaption>
                </figure>
                <div>
                  <h2>
                    Months make a year.
                    <br />
                    Years leave a trace.
                  </h2>
                  <p>
                    NASA’s Climate Spiral arranges monthly global temperature
                    anomalies around a circle. This published image follows the
                    record from 1880 through August 2023, relative to the
                    1951–1980 average.
                  </p>
                  <div className="visual-reading-key">
                    <span>Around the circle → months</span>
                    <span>Distance from the center → anomaly</span>
                    <span>Overlaid paths → the historical record</span>
                  </div>
                  <a
                    className="text-link"
                    href={frame.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Meet the original NASA visualization{" "}
                    <ExternalLink size={14} />
                  </a>
                  <p className="small">
                    NASA’s source page documents the visualization and its
                    GISTEMP data. The interpretation and sound rules here are
                    ours.
                  </p>
                </div>
              </section>
            )}
            {chapter === 2 && (
              <>
                <p className="story-lead">
                  Follow the scanning line. Image position chooses pitch, and
                  color chooses a voice.
                </p>
                <ImageJukebox compact />
              </>
            )}
            {chapter === 3 && (
              <>
                <div className="story-explanation">
                  <p>
                    Higher pitch now represents a higher NASA temperature
                    anomaly. Compare the two periods, then reveal their
                    measurements.
                  </p>
                </div>
                <ListeningTest compact embedded onComplete={setResult} />
                {result && (
                  <aside className="story-result" role="status">
                    The two periods’ mean anomalies differ by{" "}
                    <strong>
                      {Math.abs(
                        result.periods.A.mean - result.periods.B.mean,
                      ).toFixed(3)}{" "}
                      °C
                    </strong>
                    . The reveal computes that difference from the NASA
                    observations.
                  </aside>
                )}
              </>
            )}
            {chapter === 4 && (
              <>
                <Discovery compact />
              </>
            )}
            {chapter === 5 && (
              <section className="story-ending">
                <p className="story-lead">
                  You followed an image into sound, a sound into a question, and
                  a question back to observations. Every step can be retraced.
                </p>
                <div className="story-source-chain">
                  <span>NASA visualization</span>
                  <ArrowRight aria-hidden="true" />
                  <span>Explicit sound rules</span>
                  <ArrowRight aria-hidden="true" />
                  <span>Your interpretation</span>
                  <ArrowRight aria-hidden="true" />
                  <span>NASA measurements</span>
                </div>
                <h2>Explore the full record.</h2>
                <p>
                  Continue through the historical observations, the sound
                  mapping, and the science behind the experience.
                </p>
                <DetailDialog
                  label="The record behind the experience"
                  title="NASA sources and the two sound methods"
                >
                  {" "}
                  <div className="story-truth">
                    <h3>The record behind the experience</h3>
                    <p>
                      {records.length} complete annual NASA GISTEMP
                      observations, {records[0].year}–{records.at(-1)!.year}.
                      The image instrument uses two inspected EIC-tagged NASA
                      visualizations. The pixel score is an artistic
                      interpretation; annual tones encode numerical anomalies.
                      Neither is a recording of natural Earth sounds.
                    </p>
                    <a
                      href="https://data.giss.nasa.gov/gistemp/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      NASA GISS / GISTEMP v4 <ExternalLink size={12} />
                    </a>{" "}
                    ·{" "}
                    <a href="/data/eic-frames.json">
                      Image provenance manifest
                    </a>
                  </div>
                </DetailDialog>
              </section>
            )}
          </>
        )}
      </div>
      {chapter > 0 && (
        <nav
          className="journey-dock linear-dock"
          aria-label="Journey navigation"
        >
          <button
            className="story-back"
            onClick={() => go(chapter - 1)}
            disabled={leaving}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="journey-position" aria-hidden="true">
            {chapter + 1} of {chapters.length}
          </span>
          {chapter === chapters.length - 1 ? (
            <a className="button primary" href="#explorer">
              Continue
              <ArrowRight size={18} />
            </a>
          ) : (
            <button
              className="button primary"
              onClick={() => go(chapter + 1)}
              disabled={leaving}
            >
              Continue
              <ArrowRight size={18} />
            </button>
          )}
        </nav>
      )}
    </article>
  );
}
