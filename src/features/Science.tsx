import { ExternalLink, Download } from "lucide-react";
import { dataset, domain, records } from "../data/climate-loader";
import { NasaMedia } from "../components/NasaMedia";
export function Science() {
  return (
    <section className="science-page">
      <div className="page-heading">
        <h1>
          Open data.
          <br />
          An open explanation.
        </h1>
        <p className="lead">
          You should be able to follow every sound back to a NASA observation.
        </p>
      </div>
      <div className="science-columns">
        <section>
          <h2>What are you hearing?</h2>
          <p>
            Global land–ocean temperature anomalies from NASA’s GISS Surface
            Temperature Analysis, GISTEMP v4. An anomaly is the difference from
            the 1951–1980 reference-period mean. It is not Earth’s absolute
            temperature.
          </p>
          <p>
            Each complete annual J–D value becomes a short sine tone. Higher
            anomalies produce higher frequencies. All comparisons use the same
            exponential mapping, fixed global domain, amplitude and event
            duration.
          </p>
          <h2>What can the sound tell us?</h2>
          <p>
            The listening test asks whether a person can compare two climate
            periods through sound, then connect their impression to measured
            values. It is an educational experiment, not a validated assessment
            of hearing, climate knowledge or learning benefit.
          </p>
          <p>
            Year-to-year variation and multidecade patterns are different. A
            single high or low note does not establish a climate trend.
            Sonification does not establish causation. A mean of frequencies is
            not the frequency of the mean anomaly, because the mapping is
            nonlinear; results are calculated from temperature anomalies.
          </p>
          <h2>What are the limits?</h2>
          <p>
            Pitch perception varies with hearing, devices and environment. The
            sonification simplifies a global estimate; it does not express
            regional differences or observational uncertainty. Historical NASA
            values may be revised. The original monthly NASA animation is not
            frame-synchronized to our annual tones.
          </p>
          <p>
            We provide charts, numbers and text so hearing is not required to
            access the science. Keyboard and automated accessibility checks
            support testing; they do not replace feedback from people with
            different access needs.
          </p>
        </section>
        <aside className="provenance">
          <h2>NASA GISS / GISTEMP v4</h2>
          <dl>
            <div>
              <dt>Coverage</dt>
              <dd>
                1880–{records.at(-1)!.year} · {records.length} years
              </dd>
            </div>
            <div>
              <dt>Units / baseline</dt>
              <dd>°C anomaly / 1951–1980</dd>
            </div>
            <div>
              <dt>Verified</dt>
              <dd>{dataset.lastVerified}</dd>
            </div>
            <div>
              <dt>Mapping domain</dt>
              <dd>{signedDomain()}</dd>
            </div>
            <div>
              <dt>Processing</dt>
              <dd>Annual J–D; complete past years only</dd>
            </div>
            <div>
              <dt>Snapshot ID</dt>
              <dd className="hash">{dataset.id}</dd>
            </div>
            <div>
              <dt>Original CSV SHA-256</dt>
              <dd className="hash">{dataset.rawSha256}</dd>
            </div>
          </dl>
          <a className="button secondary" href="/data/climate.json" download>
            <Download size={17} />
            Normalized observations
          </a>
          <a className="text-link" href={dataset.originalData} download>
            Original NASA CSV ↓
          </a>
          <a
            className="text-link"
            href="/data/validation-report.json"
            target="_blank"
            rel="noreferrer"
          >
            Validation report <ExternalLink size={13} />
          </a>
        </aside>
      </div>
      <section className="source-list">
        <h2>Primary sources</h2>
        {[
          ["NASA GISS — GISTEMP v4", "https://data.giss.nasa.gov/gistemp/"],
          [
            "GISTEMP data documentation",
            "https://data.giss.nasa.gov/gistemp/data_v4.html",
          ],
          ["Official global land–ocean CSV", dataset.sourceUrl],
          [
            "NASA SVS — Climate Spiral / EIC resource",
            "https://svs.gsfc.nasa.gov/5190/",
          ],
          [
            "NASA media usage guidelines",
            "https://www.nasa.gov/nasa-brand-center/images-and-media/",
          ],
          [
            "Space Apps — The Earth Information Jukebox",
            "https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/",
          ],
        ].map(([title, url]) => (
          <a href={url} key={url} target="_blank" rel="noreferrer">
            {title}
            <ExternalLink size={16} />
          </a>
        ))}
      </section>
      <NasaMedia />
      <section className="section-note">
        <h2>Made by ECHO EARTH</h2>
        <p>
          Fateen — Architecture & Integration · Abdullah — NASA Data &
          Scientific Validation · Zayd — Audio & Sonification · Yaser — Frontend
          & Visualizations · Rayyan — Accessibility & Education · Vishal —
          Testing & Documentation.
        </p>
        <p>
          In collaboration with{" "}
          <a href="https://acmuobd.com" target="_blank" rel="noreferrer">
            ACM Student Chapter
          </a>{" "}
          and{" "}
          <a href="https://uobrpl.com" target="_blank" rel="noreferrer">
            UOBRPL
          </a>
          . Built with AI-assisted development; scientific sources and
          verification limits are documented in the repository. NASA does not
          endorse ECHO EARTH.
        </p>
      </section>
    </section>
  );
}
function signedDomain() {
  return `${domain.min.toFixed(2)} to +${domain.max.toFixed(2)} °C`;
}
