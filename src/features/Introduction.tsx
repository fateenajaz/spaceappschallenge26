import { ArrowRight, Headphones, ArrowUpRight } from "lucide-react";
import { records } from "../data/climate-loader";
import { NasaMedia } from "../components/NasaMedia";
export function Introduction({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="home-hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              Can you hear
              <br />a changing
              <br />
              planet?
            </h1>
            <p>
              Earth’s temperature record, transformed into sound. Listen to two
              moments in our history. Discover what your ears can tell you.
            </p>
            <div className="hero-actions">
              <button className="button primary large" onClick={onStart}>
                Start Listening <ArrowRight size={22} />
              </button>
              <a href="#explorer" className="hero-explore">
                Explore the record <ArrowUpRight size={19} />
              </a>
            </div>
            <p className="hero-headphones">
              <Headphones size={17} />
              Headphones recommended. Your volume, your pace.
            </p>
          </div>
          <figure className="hero-earth">
            <img
              src="/nasa/blue-marble-east.webp"
              alt="NASA’s Blue Marble composite of Earth, showing Africa, the Indian Ocean and Asia against space."
              fetchPriority="high"
              width="1400"
              height="1400"
            />
            <figcaption>
              <a
                href="https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/"
                target="_blank"
                rel="noreferrer"
              >
                Blue Marble · NASA Earth Observatory <ArrowUpRight size={13} />
              </a>
            </figcaption>
          </figure>
        </div>
        <div className="hero-bottom">
          <span>One planet. {records.length} years of observations.</span>
          <a href="#science">
            Built from NASA GISS data <ArrowRight size={17} />
          </a>
        </div>
      </section>
      <section className="home-story">
        <div className="story-intro">
          <h2>
            Go beyond
            <br />
            what you can see.
          </h2>
          <div>
            <p>
              Every note starts with a real measurement. Higher temperatures
              become higher pitches. The same rule applies to every year, so the
              differences you hear come from the observations.
            </p>
            <p>
              Listen first. Make a comparison. Then reveal the years, the
              numbers, and the science behind the sound.
            </p>
            <a className="editorial-link" href="#lab">
              Discover how data becomes sound{" "}
              <span>
                <ArrowRight size={19} />
              </span>
            </a>
          </div>
        </div>
        <NasaMedia />
      </section>
      <section className="home-links">
        <h2>Make your own discovery.</h2>
        <a href="#lesson">
          <span>A five-minute classroom lesson · English / العربية</span>
          <ArrowUpRight size={27} />
        </a>
        <a href="#frames">
          <span>Watch NASA’s visual record come to life with sound.</span>
          <ArrowUpRight size={27} />
        </a>
        <a href="#present">
          <span>Take the two-minute guided experience.</span>
          <ArrowUpRight size={27} />
        </a>
        <a href="#study">
          <span>Help us understand how people learn.</span>
          <ArrowUpRight size={27} />
        </a>
      </section>
    </>
  );
}
