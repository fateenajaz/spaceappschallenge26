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
    next: "Begin the journey",
    bridge:
      "We know Earth through images. Let’s begin with one that holds a history.",
  },
  {
    label: "A visual language",
    title: "Every line holds a measurement.",
    next: "Give the image a voice",
    bridge:
      "The image has a visual language. We can write a second language for the same pixels.",
  },
  {
    label: "An audible image",
    title: "Let the picture become a score.",
    next: "Listen for a measured change",
    bridge:
      "An image’s shapes can become sound. Next, the measurements have their own voice.",
  },
  {
    label: "Your discovery",
    title: "What can your ears tell you?",
    next: "Look beneath the pattern",
    bridge:
      "A long-term difference can coexist with a cooler individual year. Let’s inspect both.",
  },
  {
    label: "The bigger picture",
    title: "A changing climate has variations.",
    next: "Carry the story forward",
    bridge:
      "The sound invites a question. The observations let you investigate it.",
  },
  {
    label: "Keep listening",
    title: "A discovery becomes a conversation.",
    next: "Return to our home",
    bridge: "Choose a classroom activity, inspect the method, or listen again.",
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
      <nav className="story-index" aria-label="Story chapters">
        <span className="story-index-label">
          {String(chapter + 1).padStart(2, "0")} / 06{" "}
          <span>{current.label}</span>
        </span>
        <ol>
          {chapters.map((item, i) => (
            <li key={item.label}>
              <button
                aria-label={`${String(i + 1).padStart(2, "0")} ${item.label}`}
                onClick={() => go(i)}
                aria-current={chapter === i ? "step" : undefined}
              >
                <span className="story-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className={`story-scene story-${direction}`} key={chapter}>
        {chapter === 0 ? (
          <section className="story-opening">
            <div className="story-opening-copy">
              <p className="story-eyebrow">NASA OBSERVATIONS. A NEW WAY IN.</p>
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
            <div className="story-opening-foot">
              <span>01 — SIX CHAPTERS, ONE CONNECTED RECORD</span>
              <a href="#listen">
                Go directly to the listening test <ArrowRight size={14} />
              </a>
            </div>
          </section>
        ) : (
          <>
            <header className="story-chapter-heading">
              <p className="story-eyebrow">
                CHAPTER {String(chapter + 1).padStart(2, "0")} /{" "}
                {current.label.toUpperCase()}
              </p>
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
                  <p className="story-kicker">A RECORD, DRAWN IN CIRCLES</p>
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
                    <span>
                      <b>01</b> Around the circle → months
                    </span>
                    <span>
                      <b>02</b> Distance from the center → anomaly
                    </span>
                    <span>
                      <b>03</b> Overlaid paths → the historical record
                    </span>
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
                  Press Play. Follow the scanning line: image position chooses
                  pitch, color chooses a voice.
                </p>
                <ImageJukebox compact />
              </>
            )}
            {chapter === 3 && (
              <>
                <div className="story-explanation">
                  <p>
                    <strong>A new rule:</strong> here, higher pitch means a
                    higher NASA temperature anomaly. Compare the two periods,
                    then reveal their dates and measurements.
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
                <h2>Where will you take the next question?</h2>
                <div className="story-next-links">
                  <a href="#lesson">
                    <span>
                      Bring it to a classroom
                      <small>
                        Five-minute activity · English and draft Arabic guidance
                      </small>
                    </span>
                    <ArrowRight />
                  </a>
                  <a href="#science">
                    <span>
                      Trace every observation
                      <small>
                        NASA sources, baselines, mapping and limitations
                      </small>
                    </span>
                    <ArrowRight />
                  </a>
                  <a href="#study">
                    <span>
                      Help us make it more useful
                      <small>
                        Voluntary anonymous feedback · no learning benefit
                        claimed
                      </small>
                    </span>
                    <ArrowRight />
                  </a>
                </div>
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
        <div className="journey-dock">
          {" "}
          <footer className="story-transition">
            <div>
              <span className="story-kicker">
                {chapter === 5 ? "THE STORY CONTINUES" : "WHY WE GO ON"}
              </span>
              <p>{current.bridge}</p>
            </div>
            <button
              className="button primary large"
              onClick={() => go(chapter === 5 ? 0 : chapter + 1)}
            >
              {current.next} <ArrowRight size={19} />
            </button>
          </footer>
          <button className="story-back" onClick={() => go(chapter - 1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      )}
    </article>
  );
}
